const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
//const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const Admin = require('../models/admin');
const Customer = require('../models/Customer');
const { generateToken } = require('../utils/jwt');

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, userType, address, phone, preferredPaymentMethod } = req.body;

        // If trying to create an Admin, check if one exists
        if (userType === 'Admin') {
            const existingAdmin = await Admin.findOne();
            if (existingAdmin) {
                return res.status(400).json({ error: 'Only one admin is allowed.' });
            }
        }

        const user = new User({ name, email, password, userType, address, phone });

        if (userType === 'Admin') {
            const admin = new Admin({ userId: user._id });
            await admin.save();
        } else if (userType === 'Customer') {
            const customer = new Customer({
                userId: user._id,
                loyaltyPoints: 0,
                preferredPaymentMethod
            });
            await customer.save();
        } else {
            return res.status(400).send({ error: 'Invalid user type' });
        }

        await user.save();

        const payload = {
            id: user._id,
            email: user.email,
            userType: user.userType
        };

        const token = generateToken(payload);
        res.status(201).send({ message: 'User created successfully', token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }
        const payload = {
            id: user._id,
            email: user.email,
            userType: user.userType
        };
        const token = generateToken(payload);
        res.status(200).json({message: 'Login successful', token});
    } catch (error) {
        res.status(500).send({ message:'Error logging in', error: error.message });
    }
});

router.put('/transfer-admin/:id', async (req, res) => {
  try {
    const newAdminUser = await User.findById(req.params.id);
    if (!newAdminUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (newAdminUser.userType === 'Admin') {
      return res.status(400).json({ error: 'Target user is already an admin.' });
    }

    // Promote the target user to admin
    newAdminUser.userType = 'Admin';
    await newAdminUser.save({ validateBeforeSave: false });

    res.json({ message: `${newAdminUser.name} is now an Admin.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Demote admin to customer
router.put('/demote-admin/:id', async (req, res) => {
  try {
    const adminUser = await User.findById(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (adminUser.userType !== 'Admin') {
      return res.status(400).json({ error: 'Target user is not an admin.' });
    }

    // Demote the user to Customer
    adminUser.userType = 'Customer';
    await adminUser.save({ validateBeforeSave: false });

    res.json({ message: `${adminUser.name} has been demoted to Customer.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
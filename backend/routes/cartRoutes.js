const express = require('express');
const router = express.Router();

const Cart = require('../models/Cart');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Helper function to get Customer by User ID
const findCustomerByUserId = async (userId) => {
    return await Customer.findOne({ userId });
};

// Get the cart for a customer
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customer = await findCustomerByUserId(req.user._id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const cart = await Cart.findOne({ customerId: customer._id }).populate('items.itemId');
        res.status(200).json(cart || { items: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add item to cart
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        if (!itemId || !quantity) return res.status(400).json({ error: 'Missing required fields' });

        const customer = await findCustomerByUserId(req.user._id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        let cart = await Cart.findOne({ customerId: customer._id });
        if (!cart) cart = new Cart({ customerId: customer._id, items: [] });

        const index = cart.items.findIndex(i => i.itemId.toString() === itemId);
        if (index > -1) {
            cart.items[index].quantity += quantity;
        } else {
            cart.items.push({ itemId, quantity });
        }

        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update item quantity
router.put('/:itemId', authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity) return res.status(400).json({ error: 'Missing required fields' });

        const customer = await findCustomerByUserId(req.user._id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        let cart = await Cart.findOne({ customerId: customer._id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const index = cart.items.findIndex(i => i.itemId.toString() === req.params.itemId);
        if (index > -1) {
            cart.items[index].quantity = quantity;
        } else {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete item from cart
router.delete('/:itemId', authenticateToken, async (req, res) => {
    try {
        const customer = await findCustomerByUserId(req.user._id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        let cart = await Cart.findOne({ customerId: customer._id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const index = cart.items.findIndex(i => i.itemId.toString() === req.params.itemId);
        if (index > -1) {
            cart.items[index].quantity -= 1;
            if (cart.items[index].quantity <= 0) cart.items.splice(index, 1);
        } else {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
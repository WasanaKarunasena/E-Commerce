const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const Payment = require('../models/Payment');
const Discount = require('../models/Discount'); // ✅ Import Discount model

const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Get all orders (Admin only)
router.get('/', authenticateToken, authorizeRole("Admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'name email phone', 
        }
      })
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


// Get logged-in customer's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    const orders = await Order.find({ customerId: customer._id })
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('order_items.itemId', 'name new_price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching user's orders:", error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get orders for a specific customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.id !== req.params.customerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await Order.find({ customerId: req.params.customerId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const order = await Order.findById(id)
      .populate('order_items.itemId', 'name new_price')
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Create a new order with auto-discount


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { order_items, shippingAddress, paymentMethod = 'Other', paymentDetails } = req.body;
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) throw new Error('Customer profile not found');

    const items = await Promise.all(order_items.map(async it => {
      const prod = await Item.findById(it.itemId);
      if (!prod) throw new Error(`Item not found: ${it.itemId}`);
      return {
        itemId: prod._id,
        quantity: it.quantity,
        unitPrice: prod.new_price,
        name: prod.name,
        category: prod.category,
        subCategory: prod.subCategory
      };
    }));

    const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    console.log('🔢 Total amount:', totalAmount);

    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    console.log('📦 Available discounts:', discounts.map(d => d.code));

    let best = null;
    let discountAmount = 0;

    for (const d of discounts) {
      const applies = items.some(item =>
        (d.applicableItems || []).map(id => id.toString()).includes(item.itemId.toString()) ||
        (d.applicableSubCategories || []).map(id => id.toString()).includes(item.subCategory?.toString()) ||
        (d.applicableCategories || []).map(id => id.toString()).includes(item.category?.toString())
      );
      console.log(`→ Discount ${d.code}: applies=${applies}, minPurchase=${d.minPurchase}`);

      if (applies && totalAmount >= (d.minPurchase || 0)) {
        if (!best || d.value > best.value) {
          best = d;
        }
      }
    }

    if (best) {
      console.log('✅ Best discount chosen:', best.code);
      if (best.type === 'percentage') {
        discountAmount = (totalAmount * best.value) / 100;
        if (best.maxDiscount) discountAmount = Math.min(discountAmount, best.maxDiscount);
      } else {
        discountAmount = best.value;
      }
    }

    console.log('Final discount amount:', discountAmount);

    const lastAmount = totalAmount - discountAmount;

    // ✅ Check and reduce stock
    for (const item of items) {
      const product = await Item.findById(item.itemId);
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Create and save payment
    const payment = new Payment({
      customerId: customer._id,
      amount: totalAmount,
      currency: 'LKR',
      paymentMethod,
      transactionId: null,
      status: 'Pending'
    });
    await payment.save();

    // ✅ Create and save order
    const order = new Order({
      customerId: customer._id,
      totalAmount,
      discount: discountAmount,
      lastAmount,
      status: 'New',
      paymentStatus: 'Pending',
      paymentId: payment._id,
      order_items: items,
      shippingAddress
    });
    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order,
      appliedDiscount: best?.code || null,
      discountAmount
    });

  } catch (error) {
    console.error("🚫 Order creation error:", error.message);
    res.status(500).json({
      error: "Order creation error",
      details: error.message
    });
  }
});


// Cancel order
router.put('/cancel/:id', authenticateToken, authorizeRole("Admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'Done') return res.status(400).json({ error: 'Order already completed' });
    if (order.status === 'Cancelled') return res.status(400).json({ error: 'Order already cancelled' });

    order.status = 'Cancelled';
    order.paymentStatus = 'Cancelled';

    const payment = await Payment.findById(order.paymentId);
    if (payment) {
      payment.status = 'Cancelled';
      await payment.save();
    }

    await order.save();
    res.status(200).json({ message: 'Order cancelled successfully', order });

  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, authorizeRole("Admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { status } = req.body;
    const validStatuses = ["New", "Processing", "Done", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.status = status;

    const payment = await Payment.findById(order.paymentId);
    if (status === 'Done') {
      order.paymentStatus = 'Completed';
      if (payment) payment.status = 'Completed';
    } else if (status === 'Cancelled') {
      order.paymentStatus = 'Cancelled';
      if (payment) payment.status = 'Cancelled';
    }

    if (payment) await payment.save();
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;

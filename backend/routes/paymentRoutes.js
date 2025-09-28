const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Webhook Secret from PayHere Dashboard
const PAYHERE_WEBHOOK_SECRET = 'MerchantSecret';

// Verify PayHere webhook signature
const verifyWebhook = (req) => {
  const receivedSignature = req.headers['x-payhere-signature'];
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', PAYHERE_WEBHOOK_SECRET);
  const computedSignature = hmac.update(payload).digest('hex');
  return receivedSignature === computedSignature;
};

// PayHere Webhook Handler
router.post("/notify", async (req, res) => {
  try {
    if (!verifyWebhook(req)) {
      console.warn("Invalid webhook signature");
      return res.status(401).send("Unauthorized");
    }

    const { order_id, payment_status, payhere_amount, payment_id } = req.body;

    const order = await Order.findById(order_id);
    if (!order) {
      console.error(`Order not found: ${order_id}`);
      return res.status(404).send("Order not found");
    }

    const payment = await Payment.findById(order.paymentId);
    if (!payment) {
      console.error(`Payment not found for Order: ${order_id}`);
      return res.status(404).send("Payment not found");
    }

    // Update payment and order status based on PayHere status
    switch (payment_status) {
      case 'Success':
        payment.status = 'Completed';
        order.paymentStatus = 'Completed';
        if (order.status === 'New' || order.status === 'Processing') {
          order.status = 'Done';
        }
        break;

      case 'Pending':
        payment.status = 'Processing';
        order.paymentStatus = 'Pending';
        break;

      case 'Failed':
        payment.status = 'Failed';
        order.paymentStatus = 'Failed';
        break;

      case 'Cancelled':
        payment.status = 'Cancelled';
        order.paymentStatus = 'Cancelled';
        order.status = 'Cancelled';
        break;

      default:
        console.warn(`Unhandled payment status: ${payment_status}`);
        return res.status(400).send("Unhandled payment status");
    }

    await payment.save();
    await order.save();

    res.status(200).send("Payment status updated");
  } catch (error) {
    console.error("Error processing PayHere webhook:", error);
    res.status(500).send("Internal server error");
  }
});

// Success Page
router.get("/success", (req, res) => {
  res.send(`
    <h1>Payment Successful ✅</h1>
    <p>Order ID: ${req.query.order_id}</p>
    <p>Thank you for your purchase!</p>
    <a href="/">Return to Shop</a>
  `);
});

// Cancel Page
router.get("/cancel", (req, res) => {
  res.send(`
    <h1>Payment Cancelled ❌</h1>
    <p>Order ID: ${req.query.order_id}</p>
    <p>You can try again or contact support.</p>
    <a href="/">Try Again</a>
  `);
});

module.exports = router;

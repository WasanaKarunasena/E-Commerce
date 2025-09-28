const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  lastAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ["New", "Processing", "Done", "Cancelled"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Cancelled"],
    required: true,
  },
  order_items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
}, {
  timestamps: true,
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

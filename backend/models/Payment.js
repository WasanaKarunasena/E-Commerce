const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Net Banking', 'Other'],
    required: true
  }, // 'Other' for manual payments
  transactionId: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Processing'],
    default: 'Pending'
  }
}, {
  timestamps: true // Let Mongoose handle createdAt and updatedAt
});

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{
        itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
        quantity: { type: Number, required: true },
    }],
}, {
    timestamps: true
});

// Optional: convert timestamps to IST before saving (note: may interfere with default timestamps)
cartSchema.pre('save', function (next) {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    this.updatedAt = new Date(now.getTime() + offset);
    if (!this.createdAt) {
        this.createdAt = new Date(now.getTime() + offset);
    }
    next();
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

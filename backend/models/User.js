const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: props => `Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character!`
        }
    },
    userType: { type: String, enum: ['Customer', 'Admin'], required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: Number }
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                const phoneStr = value.toString();
                return phoneStr.length === 10 && phoneStr.startsWith('0');
            },
            message: props => `${props.value} is not a valid 10-digit phone number that starts with 0!`
        }
    },
}, {
    timestamps: true
});

// Set password hash
userSchema.pre('save', async function (next) {
    const user = this;

    // hash password if modified
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }

    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

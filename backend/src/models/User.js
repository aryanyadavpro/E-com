const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer',
    },
    // Seller specific fields (optional for customers)
    businessName: String,
    gstNumber: String,
    businessAddress: Object,
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

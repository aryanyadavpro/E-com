const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    highlights: [String],
    specifications: Object,

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subcategory: String,
    brand: String,

    pricing: {
        regularPrice: { type: Number, required: true },
        salePrice: Number,
        discount: Number,
        tax: Number
    },

    inventory: {
        sku: { type: String, unique: true },
        stock: { type: Number, required: true, default: 0 },
        lowStockThreshold: { type: Number, default: 5 }
    },

    variants: [{
        name: String, // e.g., "Color"
        options: [{
            value: String,
            price: Number,
            stock: Number,
            sku: String
        }]
    }],

    images: [{
        url: String,
        alt: String,
        isPrimary: Boolean
    }],

    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        shippingCharge: Number,
        freeShipping: { type: Boolean, default: false }
    },

    seo: {
        metaTitle: String,
        metaDescription: String
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'draft',
    },

    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },

    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const count = await Product.countDocuments({ ...keyword, status: 'active' });
        const products = await Product.find({ ...keyword, status: 'active' })
            .populate('category', 'name slug')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category', 'name slug')
            .populate('seller', 'fullName businessName');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            category,
            pricing, // { regularPrice, salePrice, ... }
            inventory, // { stock, sku }
            images,
            shipping,
            highlights,
            specifications
        } = req.body;

        const product = new Product({
            name,
            slug,
            description,
            category,
            pricing,
            inventory,
            images,
            shipping,
            highlights,
            specifications,
            seller: req.user._id,
            status: 'active', // Auto-activate for demo
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller products
// @route   GET /api/products/seller/my-products
// @access  Private/Seller
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    createProduct,
    getMyProducts,
};

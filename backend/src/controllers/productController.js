const Product = require('../models/Product');
const logger = require('../utils/logger');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const pageSize = parseInt(req.query.pageSize) || 12;
        const page = parseInt(req.query.page) || 1;

        if (page < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Page must be greater than 0' 
            });
        }

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
            .populate('seller', 'fullName businessName')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ 
            success: true,
            data: products, 
            pagination: {
                page, 
                pages: Math.ceil(count / pageSize),
                total: count
            }
        });
    } catch (error) {
        logger.error('Error fetching products:', error);
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
            .populate('category', 'name slug')
            .populate('seller', 'fullName businessName email phoneNumber');

        if (!product) {
            logger.warn(`Product not found: ${req.params.slug}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Increment views
        await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

        res.json({ 
            success: true, 
            data: product 
        });
    } catch (error) {
        logger.error('Error fetching product:', error);
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            description,
            category,
            pricing,
            inventory,
            images,
            shipping,
            highlights,
            specifications
        } = req.body;

        // Validation
        if (!name || !slug || !description || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Check if product with same slug exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product with this slug already exists' 
            });
        }

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
            status: 'draft',
        });

        const createdProduct = await product.save();
        logger.info(`Product created: ${slug} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: createdProduct
        });
    } catch (error) {
        logger.error('Error creating product:', error);
        next(error);
    }
};

// @desc    Get seller products
// @route   GET /api/products/seller/my-products
// @access  Private/Seller
const getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ seller: req.user._id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
            
        res.json({ 
            success: true, 
            data: products 
        });
    } catch (error) {
        logger.error('Error fetching seller products:', error);
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString()) {
            logger.warn(`Unauthorized product update attempt by ${req.user.email}`);
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this product' 
            });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        logger.info(`Product updated: ${product._id} by ${req.user.email}`);
        res.json({ 
            success: true, 
            data: product 
        });
    } catch (error) {
        logger.error('Error updating product:', error);
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString()) {
            logger.warn(`Unauthorized product delete attempt by ${req.user.email}`);
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this product' 
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        logger.info(`Product deleted: ${req.params.id} by ${req.user.email}`);
        res.json({ 
            success: true, 
            message: 'Product deleted' 
        });
    } catch (error) {
        logger.error('Error deleting product:', error);
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
};

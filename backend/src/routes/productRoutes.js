const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductBySlug,
    createProduct,
    getMyProducts,
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/auth');

router.route('/').get(getProducts).post(protect, seller, createProduct);
router.get('/seller/my-products', protect, seller, getMyProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;

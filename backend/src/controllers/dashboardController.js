const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get seller dashboard stats
// @route   GET /api/dashboard/seller-stats
// @access  Private/Seller
const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // 1. Total Sales & Total Orders
        // Find all orders that have items sold by this seller
        const orders = await Order.find({ 'orderItems.seller': sellerId });

        let totalSales = 0;
        let totalOrders = orders.length;

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.seller.toString() === sellerId.toString()) {
                    totalSales += item.price * item.qty;
                }
            });
        });

        // 2. Active Products
        const activeProducts = await Product.countDocuments({ seller: sellerId, status: 'active' });

        // 3. Total Products (including drafts/inactive)
        const totalProducts = await Product.countDocuments({ seller: sellerId });

        // 4. Recent Orders (limit 5)
        // We'll return the whole order but front-end might need to filter items to only show this seller's items
        const recentOrders = await Order.find({ 'orderItems.seller': sellerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.json({
            totalSales,
            totalOrders,
            activeProducts,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSellerStats
};

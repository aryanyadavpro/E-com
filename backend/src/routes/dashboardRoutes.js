const express = require('express');
const router = express.Router();
const { getSellerStats } = require('../controllers/dashboardController');
const { protect, seller } = require('../middleware/auth');

router.get('/seller-stats', protect, seller, getSellerStats);

module.exports = router;

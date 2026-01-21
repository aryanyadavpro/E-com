const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                logger.warn('User not found for token');
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            next();
        } catch (error) {
            logger.error('Token verification failed:', error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        logger.warn('No token provided');
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        logger.warn(`Unauthorized admin access attempt by ${req.user?.email}`);
        return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

const seller = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
        next();
    } else {
        logger.warn(`Unauthorized seller access attempt by ${req.user?.email}`);
        return res.status(403).json({ success: false, message: 'Not authorized as a seller' });
    }
};

module.exports = { protect, admin, seller };

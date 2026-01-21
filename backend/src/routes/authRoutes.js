const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRegistration = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

router.post('/signup', validateRegistration, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/refresh', refreshToken);

module.exports = router;

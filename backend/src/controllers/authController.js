const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { validateEmail, validatePassword, validatePhoneNumber } = require('../utils/validators');

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, phoneNumber, role, businessName, gstNumber, businessAddress } = req.body;

        // Validation
        if (!fullName || !email || !password || !phoneNumber) {
            logger.warn('Missing required fields in registration');
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        if (!validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            role: role || 'customer',
            businessName,
            gstNumber,
            businessAddress
        });

        const { accessToken, refreshToken } = generateTokens(user.id);

        logger.info(`New user registered: ${email}`);
        res.status(201).json({
            success: true,
            data: {
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                businessName: user.businessName || null,
                gstNumber: user.gstNumber || null,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error('Registration error:', error);
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password required' 
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            logger.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.warn(`Failed login attempt for: ${email}`);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);

        logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            data: {
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                businessName: user.businessName || null,
                gstNumber: user.gstNumber || null,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: 'Refresh token required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            success: true,
            accessToken,
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid refresh token' 
        });
    }
};

module.exports = { registerUser, loginUser, refreshToken };

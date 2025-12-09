const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    register,
    login,
    getMe,
    updatePassword,
    refreshAccessToken,
    logout,
    verifyToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.MAX_LOGIN_REQUESTS) || 5,
    message: 'Too many login attempts, please try again later'
});

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;

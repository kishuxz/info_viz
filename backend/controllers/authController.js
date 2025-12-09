const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user' // Default to 'user' if not specified
        });

        // Create access token and refresh token
        const token = user.getSignedJwtToken();
        const refreshToken = user.getSignedRefreshToken();

        // Save refresh token to database
        await user.save();

        res.status(201).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }

        // Check for user (include password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Create access token and refresh token
        const token = user.getSignedJwtToken();
        const refreshToken = user.getSignedRefreshToken();

        // Update last activity and save refresh token
        user.lastActivity = Date.now();
        await user.save();

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                error: 'Password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a refresh token'
            });
        }

        // Find user with this refresh token (we need to check all users since token is hashed)
        // This is inefficient but works for now. For production, consider storing userId with refresh token
        const users = await User.find({}).select('+refreshToken +refreshTokenExpiry');

        let user = null;
        for (const u of users) {
            if (u.verifyRefreshToken(refreshToken)) {
                user = u;
                break;
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Generate new access token and refresh token
        const newAccessToken = user.getSignedJwtToken();
        const newRefreshToken = user.getSignedRefreshToken();

        // Update last activity
        user.lastActivity = Date.now();
        await user.save();

        res.status(200).json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Logout user and blacklist token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            // Decode token to get expiry
            const decoded = jwt.decode(token);
            const expiresAt = new Date(decoded.exp * 1000);

            // Add token to blacklist
            await TokenBlacklist.addToBlacklist(token, req.user.id, expiresAt, 'logout');
        }

        // Clear refresh token from user
        req.user.refreshToken = undefined;
        req.user.refreshTokenExpiry = undefined;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Verify if token is valid
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
    try {
        // If we reach here, the protect middleware has already verified the token
        res.status(200).json({
            success: true,
            valid: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

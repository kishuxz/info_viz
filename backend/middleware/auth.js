const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Parse time string (e.g., "30m", "1h") to milliseconds
const parseTimeToMs = (timeStr) => {
    if (!timeStr) return 30 * 60 * 1000; // Default 30 minutes
    const value = parseInt(timeStr);
    const unit = timeStr.replace(value.toString(), '');

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return value;
    }
};

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
            code: 'NO_TOKEN'
        });
    }

    try {
        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                error: 'Token has been invalidated',
                code: 'TOKEN_BLACKLISTED'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check for session timeout (inactivity)
        const sessionTimeout = parseTimeToMs(process.env.SESSION_TIMEOUT);
        const lastActivity = new Date(req.user.lastActivity).getTime();
        const now = Date.now();

        if (now - lastActivity > sessionTimeout) {
            return res.status(401).json({
                success: false,
                error: 'Session expired due to inactivity',
                code: 'SESSION_TIMEOUT'
            });
        }

        // Update last activity timestamp
        req.user.lastActivity = now;
        await req.user.save({ validateBeforeSave: false });

        next();
    } catch (err) {
        let errorCode = 'INVALID_TOKEN';
        let errorMessage = 'Not authorized to access this route';

        if (err.name === 'TokenExpiredError') {
            errorCode = 'TOKEN_EXPIRED';
            errorMessage = 'Token has expired';
        } else if (err.name === 'JsonWebTokenError') {
            errorCode = 'INVALID_TOKEN';
            errorMessage = 'Invalid token';
        }

        return res.status(401).json({
            success: false,
            error: errorMessage,
            code: errorCode
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

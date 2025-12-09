const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Don't return password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    refreshToken: {
        type: String,
        select: false // Don't return refresh token in queries by default
    },
    refreshTokenExpiry: {
        type: Date,
        select: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and store refresh token
UserSchema.methods.getSignedRefreshToken = function () {
    const crypto = require('crypto');
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Hash the refresh token before storing
    this.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Set expiry (7 days from now)
    const expiryDays = parseInt(process.env.JWT_REFRESH_EXPIRE?.replace('d', '')) || 7;
    this.refreshTokenExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    return refreshToken; // Return unhashed token to send to client
};

// Verify refresh token
UserSchema.methods.verifyRefreshToken = function (token) {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token matches and hasn't expired
    return this.refreshToken === hashedToken && this.refreshTokenExpiry > Date.now();
};

// Update last activity timestamp
UserSchema.methods.updateActivity = function () {
    this.lastActivity = Date.now();
    return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const TokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true // For fast lookups
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['logout', 'password_change', 'security'],
        default: 'logout'
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true // For automatic cleanup
    }
});

// Automatically remove expired tokens after their expiration time
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to check if a token is blacklisted
TokenBlacklistSchema.statics.isBlacklisted = async function (token) {
    const blacklisted = await this.findOne({ token, expiresAt: { $gt: Date.now() } });
    return !!blacklisted;
};

// Static method to add a token to blacklist
TokenBlacklistSchema.statics.addToBlacklist = async function (token, userId, expiresAt, reason = 'logout') {
    try {
        await this.create({
            token,
            userId,
            reason,
            expiresAt
        });
        return true;
    } catch (err) {
        // Token might already be blacklisted, which is fine
        if (err.code === 11000) return true;
        throw err;
    }
};

module.exports = mongoose.model('TokenBlacklist', TokenBlacklistSchema);

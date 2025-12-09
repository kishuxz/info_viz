const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
        index: true
    },
    eventId: {
        type: String,
        required: true,
        index: true
    },
    responseData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        default: null
    }
});

// Index for faster queries
ResponseSchema.index({ formId: 1, submittedAt: -1 });
ResponseSchema.index({ eventId: 1, submittedAt: -1 });

module.exports = mongoose.model('Response', ResponseSchema);

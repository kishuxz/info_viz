const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please add a form title'],
        trim: true
    },
    eventId: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: [true, 'Please add an event name'],
        trim: true
    },
    eventDate: {
        type: String,
        required: [true, 'Please add an event date']
    },
    baseRequired: {
        type: Array,
        default: []
    },
    baseOptional: {
        type: Array,
        default: []
    },
    extraFields: {
        type: Array,
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
FormSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
FormSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('Form', FormSchema);

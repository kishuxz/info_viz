const Form = require('../models/Form');
const User = require('../models/User');

// @desc    Get all forms (public, active only)
// @route   GET /api/forms
// @access  Public
exports.getForms = async (req, res) => {
    try {
        const forms = await Form.find({ isActive: true }).select('-__v');

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all forms for a specific admin
// @route   GET /api/forms/admin/:adminId
// @access  Private
exports.getFormsForAdmin = async (req, res) => {
    try {
        const forms = await Form.find({ adminId: req.params.adminId }).select('-__v');

        res.status(200).json({
            success: true,
            count: forms.length,
            forms: forms // Match frontend expectation
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get single form by ID
// @route   GET /api/forms/:id
// @access  Public
exports.getForm = async (req, res) => {
    try {
        const form = await Form.findOne({ id: req.params.id });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        res.status(200).json({
            success: true,
            data: form
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Create new form
// @route   POST /api/forms
// @access  Private (Admin only)
exports.createForm = async (req, res) => {
    try {
        const {
            id,
            adminId,
            title,
            eventId,
            eventName,
            eventDate,
            baseRequired,
            baseOptional,
            extraFields
        } = req.body;

        // Check if form with this ID already exists
        const existingForm = await Form.findOne({ id });

        if (existingForm) {
            // Update existing form instead
            existingForm.title = title;
            existingForm.eventName = eventName;
            existingForm.eventDate = eventDate;
            existingForm.baseRequired = baseRequired || [];
            existingForm.baseOptional = baseOptional || [];
            existingForm.extraFields = extraFields || [];
            existingForm.updatedAt = Date.now();

            await existingForm.save();

            return res.status(200).json({
                success: true,
                data: existingForm
            });
        }

        // Create new form
        const form = await Form.create({
            id,
            adminId,
            title,
            eventId,
            eventName,
            eventDate,
            baseRequired: baseRequired || [],
            baseOptional: baseOptional || [],
            extraFields: extraFields || []
        });

        res.status(201).json({
            success: true,
            data: form
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update form
// @route   PUT /api/forms/:id
// @access  Private (Admin only)
exports.updateForm = async (req, res) => {
    try {
        let form = await Form.findOne({ id: req.params.id });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        // Make sure user owns the form
        if (form.adminId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this form'
            });
        }

        form = await Form.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: form
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Delete form
// @route   DELETE /api/forms/:id
// @access  Private (Admin only)
exports.deleteForm = async (req, res) => {
    try {
        const form = await Form.findOne({ id: req.params.id });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        // Make sure user owns the form
        if (form.adminId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this form'
            });
        }

        await Form.deleteOne({ id: req.params.id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

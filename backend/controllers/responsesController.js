const Response = require('../models/Response');
const Form = require('../models/Form');
const { Parser } = require('json2csv');

// @desc    Submit form response
// @route   POST /api/forms/:id/submit
// @access  Public
exports.submitResponse = async (req, res) => {
    try {
        const formId = req.params.id;

        // Check if form exists
        const form = await Form.findOne({ id: formId });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        // Get IP address (optional)
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Create response
        const response = await Response.create({
            formId: form._id,
            eventId: form.eventId,
            responseData: req.body,
            ipAddress
        });

        res.status(201).json({
            success: true,
            data: response
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all responses for a form
// @route   GET /api/forms/:id/responses
// @access  Private (Admin only)
exports.getResponses = async (req, res) => {
    try {
        const formId = req.params.id;

        // Check if form exists
        const form = await Form.findOne({ id: formId });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        // Get all responses
        const responses = await Response.find({ formId: form._id })
            .sort({ submittedAt: -1 })
            .select('-__v');

        // Flatten responses for easier frontend consumption
        const rows = responses.map(r => r.responseData);

        res.status(200).json({
            success: true,
            count: responses.length,
            rows: rows
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Export responses as CSV
// @route   GET /api/forms/:id/export
// @access  Private (Admin only)
exports.exportResponses = async (req, res) => {
    try {
        const formId = req.params.id;

        // Check if form exists
        const form = await Form.findOne({ id: formId });

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found'
            });
        }

        // Get all responses
        const responses = await Response.find({ formId: form._id })
            .sort({ submittedAt: -1 });

        if (responses.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No responses found for this form'
            });
        }

        // Flatten the response data
        const flattenedData = responses.map(response => {
            const data = { ...response.responseData };

            // Flatten connections array if it exists
            if (data.connections && Array.isArray(data.connections)) {
                data.connections = JSON.stringify(data.connections);
            }

            // Add submission timestamp
            data.submittedAt = response.submittedAt;

            return data;
        });

        // Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(flattenedData);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${form.eventName || formId}_responses.csv"`);

        res.status(200).send(csv);
    } catch (err) {
        console.error('CSV Export Error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

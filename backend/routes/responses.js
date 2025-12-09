const express = require('express');
const router = express.Router();
const {
    submitResponse,
    getResponses,
    exportResponses
} = require('../controllers/responsesController');
const { protect, authorize } = require('../middleware/auth');

// Public route - anyone can submit a response
router.post('/:id/submit', submitResponse);

// Protected routes - admin only
router.get('/:id/responses', protect, getResponses);
router.get('/:id/export', protect, exportResponses);

module.exports = router;

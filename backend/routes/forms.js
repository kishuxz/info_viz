const express = require('express');
const router = express.Router();
const {
    getForms,
    getFormsForAdmin,
    getForm,
    createForm,
    updateForm,
    deleteForm
} = require('../controllers/formsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getForms);

// Protected routes - require authentication  
// IMPORTANT: Specific routes must come before generic /:id route
router.get('/admin/:adminId', protect, getFormsForAdmin);
router.post('/', protect, createForm);
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);

// Generic routes (must be last to avoid matching everything)
router.get('/:id', getForm);

module.exports = router;

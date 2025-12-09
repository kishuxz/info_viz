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
router.get('/:id', getForm);

// Protected routes - require authentication
router.get('/admin/:adminId', protect, getFormsForAdmin);
router.post('/', protect, createForm);
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);

module.exports = router;

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Get all invoices
router.get('/', invoiceController.getAll);

// Get invoice by ID
router.get('/:id', invoiceController.getById);

// Get invoices by project
router.get('/project/:projectId', invoiceController.getByProject);

// Get invoices by client
router.get('/client/:clientId', invoiceController.getByClient);

// Create a new invoice
router.post('/', invoiceController.create);

// Update an invoice
router.put('/:id', invoiceController.update);

// Delete an invoice
router.delete('/:id', invoiceController.delete);

// Mark invoice as paid
router.post('/:id/pay', invoiceController.markAsPaid);

// Generate PDF
router.get('/:id/pdf', invoiceController.generatePdf);

module.exports = router;
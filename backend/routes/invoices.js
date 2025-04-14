const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Rutas para facturas
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.get('/project/:projectId', invoiceController.getByProject);
router.get('/client/:clientId', invoiceController.getByClient);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.delete);
router.post('/:id/pay', invoiceController.markAsPaid);
router.get('/:id/pdf', invoiceController.generatePdf);
router.post('/:id/send-email', invoiceController.sendByEmail);

module.exports = router;
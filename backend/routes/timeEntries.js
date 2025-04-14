const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .get(timeEntryController.getTimeEntries)
  .post(timeEntryController.createTimeEntry);

router.route('/stats')
  .get(timeEntryController.getTimeStats);

router.route('/:id')
  .get(timeEntryController.getTimeEntryById)
  .put(timeEntryController.updateTimeEntry)
  .delete(timeEntryController.deleteTimeEntry);

module.exports = router;
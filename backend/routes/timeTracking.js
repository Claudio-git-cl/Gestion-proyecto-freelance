const express = require('express');
const router = express.Router();
const { 
  getTimeEntries, 
  startTimeTracking, 
  stopTimeTracking, 
  addTimeEntry, 
  deleteTimeEntry 
} = require('../controllers/timeTrackingController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

router.route('/')
  .get(getTimeEntries)
  .post(addTimeEntry);

router.post('/start', startTimeTracking);
router.put('/:id/stop', stopTimeTracking);
router.delete('/:id', deleteTimeEntry);

module.exports = router;
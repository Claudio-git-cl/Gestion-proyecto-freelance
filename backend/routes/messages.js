const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  sendMessage, 
  markAsRead 
} = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.put('/:id/read', markAsRead);

module.exports = router;
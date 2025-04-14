const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProjectById)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

// Rutas para tareas
router.post('/:id/tasks', projectController.addTask);
router.put('/:projectId/tasks/:taskId', projectController.updateTask);
router.delete('/:projectId/tasks/:taskId', projectController.deleteTask);

module.exports = router;
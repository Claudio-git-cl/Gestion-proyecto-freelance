const { TimeTracking, Project } = require('../models');

// @desc    Obtener registros de tiempo de un proyecto
// @route   GET /api/time-tracking?projectId=id
// @access  Private
exports.getTimeEntries = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Se requiere el ID del proyecto' });
    }

    // Verificar que el usuario tenga acceso al proyecto
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const user = req.user;
    if (user.role !== 'admin' && 
        user.id !== project.clientId && 
        user.id !== project.freelancerId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Obtener registros de tiempo
    const timeEntries = await TimeTracking.findAll({
      where: { projectId },
      order: [['startTime', 'DESC']]
    });

    res.json(timeEntries);
  } catch (error) {
    console.error('Error al obtener registros de tiempo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Iniciar seguimiento de tiempo
// @route   POST /api/time-tracking/start
// @access  Private (solo freelancers)
exports.startTimeTracking = async (req, res) => {
  try {
    const { projectId, description } = req.body;
    
    // Verificar que el usuario sea freelancer
    if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los freelancers pueden registrar tiempo' });
    }

    // Verificar que el usuario tenga acceso al proyecto
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (req.user.id !== project.freelancerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Verificar si ya hay un registro activo
    const activeEntry = await TimeTracking.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (activeEntry) {
      return res.status(400).json({ 
        message: 'Ya tienes un registro de tiempo activo',
        activeEntry
      });
    }

    // Crear registro de tiempo
    const timeEntry = await TimeTracking.create({
      description,
      startTime: new Date(),
      projectId,
      userId: req.user.id,
      isActive: true
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error al iniciar seguimiento de tiempo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Detener seguimiento de tiempo
// @route   PUT /api/time-tracking/:id/stop
// @access  Private
exports.stopTimeTracking = async (req, res) => {
  try {
    const timeEntry = await TimeTracking.findByPk(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Registro de tiempo no encontrado' });
    }

    // Verificar que el usuario sea el propietario
    if (req.user.id !== timeEntry.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Verificar que el registro esté activo
    if (!timeEntry.isActive) {
      return res.status(400).json({ message: 'El registro de tiempo ya está detenido' });
    }

    const endTime = new Date();
    const startTime = new Date(timeEntry.startTime);
    
    // Calcular duración en minutos
    const duration = Math.round((endTime - startTime) / (1000 * 60));

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.isActive = false;
    
    await timeEntry.save();

    res.json(timeEntry);
  } catch (error) {
    console.error('Error al detener seguimiento de tiempo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Agregar registro de tiempo manual
// @route   POST /api/time-tracking
// @access  Private (solo freelancers)
exports.addTimeEntry = async (req, res) => {
  try {
    const { projectId, description, startTime, endTime } = req.body;
    
    // Verificar que el usuario sea freelancer
    if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los freelancers pueden registrar tiempo' });
    }

    // Verificar que el usuario tenga acceso al proyecto
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (req.user.id !== project.freelancerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Validar fechas
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }

    // Calcular duración en minutos
    const duration = Math.round((end - start) / (1000 * 60));

    // Crear registro de tiempo
    const timeEntry = await TimeTracking.create({
      description,
      startTime: start,
      endTime: end,
      duration,
      projectId,
      userId: req.user.id,
      isActive: false
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error al agregar registro de tiempo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Eliminar registro de tiempo
// @route   DELETE /api/time-tracking/:id
// @access  Private
exports.deleteTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeTracking.findByPk(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Registro de tiempo no encontrado' });
    }

    // Verificar que el usuario sea el propietario o admin
    if (req.user.id !== timeEntry.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await timeEntry.destroy();

    res.json({ message: 'Registro de tiempo eliminado' });
  } catch (error) {
    console.error('Error al eliminar registro de tiempo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
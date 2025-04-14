const Project = require('../models/Project');
const Client = require('../models/Client');

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .populate('client', 'name company');
    
    res.json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('client', 'name email phone company');

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear un nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    // Verificar si el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: req.body.client,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const newProject = new Project({
      ...req.body,
      user: req.user.id
    });

    const project = await newProject.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un proyecto
exports.updateProject = async (req, res) => {
  try {
    // Si se está actualizando el cliente, verificar que existe
    if (req.body.client) {
      const client = await Client.findOne({
        _id: req.body.client,
        user: req.user.id
      });

      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar un proyecto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Añadir una tarea a un proyecto
exports.addTask = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    project.tasks.push(req.body);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Error al añadir tarea:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar una tarea
exports.updateTask = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const taskIndex = project.tasks.findIndex(
      task => task._id.toString() === req.params.taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Actualizar los campos de la tarea
    Object.keys(req.body).forEach(key => {
      project.tasks[taskIndex][key] = req.body[key];
    });

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar una tarea
exports.deleteTask = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Filtrar la tarea a eliminar
    project.tasks = project.tasks.filter(
      task => task._id.toString() !== req.params.taskId
    );

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
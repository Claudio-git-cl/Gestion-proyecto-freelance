const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

// Obtener todas las entradas de tiempo
exports.getTimeEntries = async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    // Construir filtro base
    const filter = { user: req.user.id };
    
    // Añadir filtros adicionales si se proporcionan
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (projectId) {
      filter.project = projectId;
    }
    
    const timeEntries = await TimeEntry.find(filter)
      .populate('project', 'name client')
      .populate({
        path: 'project',
        populate: {
          path: 'client',
          select: 'name'
        }
      })
      .sort({ date: -1 });
    
    // Añadir nombre del proyecto a cada entrada
    const formattedEntries = timeEntries.map(entry => {
      const { _id, project, description, date, duration, billable, hourlyRate, invoiced, createdAt, updatedAt } = entry;
      
      return {
        id: _id,
        projectId: project._id,
        projectName: project.name,
        clientName: project.client ? project.client.name : 'Sin cliente',
        description,
        date,
        duration,
        billable,
        hourlyRate,
        amount: entry.amount,
        invoiced,
        createdAt,
        updatedAt
      };
    });
    
    res.json(formattedEntries);
  } catch (error) {
    console.error('Error al obtener entradas de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener una entrada de tiempo por ID
exports.getTimeEntryById = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('project', 'name client');

    if (!timeEntry) {
      return res.status(404).json({ message: 'Entrada de tiempo no encontrada' });
    }

    res.json(timeEntry);
  } catch (error) {
    console.error('Error al obtener entrada de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear una nueva entrada de tiempo
exports.createTimeEntry = async (req, res) => {
  try {
    // Verificar si el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: req.body.project,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Si es facturable y no se proporciona tarifa, usar la del proyecto
    if (req.body.billable && !req.body.hourlyRate) {
      req.body.hourlyRate = project.hourlyRate;
    }

    const newTimeEntry = new TimeEntry({
      ...req.body,
      user: req.user.id
    });

    const timeEntry = await newTimeEntry.save();
    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error al crear entrada de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar una entrada de tiempo
exports.updateTimeEntry = async (req, res) => {
  try {
    // Si se está actualizando el proyecto, verificar que existe
    if (req.body.project) {
      const project = await Project.findOne({
        _id: req.body.project,
        user: req.user.id
      });

      if (!project) {
        return res.status(404).json({ message: 'Proyecto no encontrado' });
      }
      
      // Si es facturable y no se proporciona tarifa, usar la del proyecto
      if (req.body.billable && !req.body.hourlyRate) {
        req.body.hourlyRate = project.hourlyRate;
      }
    }

    const timeEntry = await TimeEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!timeEntry) {
      return res.status(404).json({ message: 'Entrada de tiempo no encontrada' });
    }

    res.json(timeEntry);
  } catch (error) {
    console.error('Error al actualizar entrada de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar una entrada de tiempo
exports.deleteTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!timeEntry) {
      return res.status(404).json({ message: 'Entrada de tiempo no encontrada' });
    }

    res.json({ message: 'Entrada de tiempo eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar entrada de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener estadísticas de tiempo
exports.getTimeStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Inicio y fin de la semana actual
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    // Inicio y fin del mes actual
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Horas de la semana actual
    const weeklyHours = await TimeEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: weekStart, $lte: weekEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' }
        }
      }
    ]);
    
    // Horas del mes actual
    const monthlyHours = await TimeEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' }
        }
      }
    ]);
    
    // Horas por proyecto (mes actual)
    const hoursByProject = await TimeEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$project',
          totalHours: { $sum: '$duration' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $unwind: '$projectInfo'
      },
      {
        $project: {
          projectId: '$_id',
          projectName: '$projectInfo.name',
          totalHours: 1
        }
      }
    ]);
    
    res.json({
      weeklyHours: weeklyHours.length > 0 ? weeklyHours[0].totalHours : 0,
      monthlyHours: monthlyHours.length > 0 ? monthlyHours[0].totalHours : 0,
      hoursByProject
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de tiempo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
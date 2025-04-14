const { Message, User, Project } = require('../models');

// @desc    Obtener mensajes de un proyecto
// @route   GET /api/messages?projectId=id
// @access  Private
exports.getMessages = async (req, res) => {
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

    // Obtener mensajes
    const messages = await Message.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Enviar un mensaje
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, receiverId, projectId } = req.body;
    
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

    // Verificar que el destinatario esté relacionado con el proyecto
    if (receiverId !== project.clientId && receiverId !== project.freelancerId) {
      return res.status(400).json({ message: 'Destinatario inválido' });
    }

    // Crear mensaje
    const message = await Message.create({
      content,
      senderId: user.id,
      receiverId,
      projectId,
      isRead: false
    });

    // Obtener mensaje con relaciones
    const newMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Marcar mensaje como leído
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    // Verificar que el usuario sea el destinatario
    if (req.user.id !== message.receiverId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    message.isRead = true;
    await message.save();

    // Obtener mensaje actualizado con relaciones
    const updatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
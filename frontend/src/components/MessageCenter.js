import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Badge
} from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';
import { getMessages, sendMessage, markAsRead } from '../redux/slices/messageSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MessageCenter = ({ projectId }) => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);
  const { project } = useSelector(state => state.projects);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Obtener mensajes al cargar el componente
  useEffect(() => {
    if (projectId) {
      dispatch(getMessages(projectId));
    }
  }, [dispatch, projectId]);
  
  // Desplazarse al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Marcar mensajes como leídos
  useEffect(() => {
    if (messages.length > 0 && user) {
      messages.forEach(message => {
        if (message.receiverId === user.id && !message.isRead) {
          dispatch(markAsRead(message.id));
        }
      });
    }
  }, [dispatch, messages, user]);
  
  // Enviar mensaje
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Determinar el destinatario (si el usuario es cliente, enviar al freelancer y viceversa)
    const receiverId = user.id === project.clientId 
      ? project.freelancerId 
      : project.clientId;
    
    dispatch(sendMessage({
      content: newMessage,
      receiverId,
      projectId
    }));
    
    setNewMessage('');
  };
  
  // Obtener nombre del remitente
  const getSenderName = (senderId) => {
    if (!project) return 'Usuario';
    
    if (senderId === project.clientId) {
      return project.client?.name || 'Cliente';
    } else if (senderId === project.freelancerId) {
      return project.freelancer?.name || 'Freelancer';
    }
    
    return 'Usuario';
  };
  
  // Verificar si el mensaje es del usuario actual
  const isCurrentUser = (senderId) => {
    return user && user.id === senderId;
  };
  
  // Formatear fecha
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es });
  };
  
  if (!project) {
    return (
      <Typography variant="body1" color="text.secondary">
        Cargando información del proyecto...
      </Typography>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Mensajes del Proyecto
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          maxHeight: '60vh', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {messages.map((message, index) => {
              const isUser = isCurrentUser(message.senderId);
              
              return (
                <React.Fragment key={message.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      mb: 1
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: isUser ? '0px' : '50px' }}>
                      {!isUser && (
                        <Avatar alt={getSenderName(message.senderId)}>
                          {getSenderName(message.senderId).charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    
                    <Box 
                      sx={{ 
                        maxWidth: '70%',
                        bgcolor: isUser ? 'primary.light' : 'grey.100',
                        color: isUser ? 'white' : 'text.primary',
                        borderRadius: '10px',
                        p: 2,
                        ml: isUser ? 1 : 0,
                        mr: isUser ? 0 : 1
                      }}
                    >
                      {!isUser && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {getSenderName(message.senderId)}
                        </Typography>
                      )}
                      
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        color={isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                        sx={{ 
                          display: 'block', 
                          textAlign: 'right',
                          mt: 1
                        }}
                      >
                        {formatDate(message.createdAt)}
                        {!isUser && message.isRead && ' • Leído'}
                      </Typography>
                    </Box>
                  </ListItem>
                  
                  {index < messages.length - 1 && (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'center',
                        my: 2
                      }}
                    >
                      {new Date(message.createdAt).toDateString() !== 
                       new Date(messages[index + 1].createdAt).toDateString() && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            bgcolor: 'grey.200', 
                            px: 2, 
                            py: 0.5, 
                            borderRadius: '10px'
                          }}
                        >
                          {format(new Date(messages[index + 1].createdAt), 'dd MMMM yyyy', { locale: es })}
                        </Typography>
                      )}
                    </Box>
                  )}
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        ) : (
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              my: 4,
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            No hay mensajes en este proyecto. ¡Envía el primero!
          </Typography>
        )}
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="primary" sx={{ mr: 1 }}>
              <AttachFile />
            </IconButton>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              multiline
              maxRows={4}
              sx={{ mr: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              endIcon={<Send />}
              type="submit"
              disabled={loading || !newMessage.trim()}
            >
              Enviar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MessageCenter;
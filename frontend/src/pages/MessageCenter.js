import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Send,
  AttachFile,
  Search,
  MoreVert,
  ArrowBack
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaremos estas acciones cuando creemos los slices correspondientes
// import { getConversations, getMessages, sendMessage } from '../redux/slices/messageSlice';

const MessageCenter = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Estos estados vendrán del Redux store cuando implementemos los slices
  // const { conversations, activeConversation, messages, loading, error } = useSelector(state => state.messages);
  
  // Estado simulado para desarrollo
  const [conversations, setConversations] = useState([
    {
      id: '1',
      participants: [
        { id: '1', name: 'Juan Pérez', avatar: null, role: 'client' },
        { id: '2', name: 'Ana Gómez', avatar: null, role: 'freelancer' }
      ],
      lastMessage: {
        text: 'Hola, ¿cómo va el proyecto?',
        timestamp: new Date(2023, 5, 15, 14, 30),
        senderId: '1'
      },
      unreadCount: 2,
      projectId: '101',
      projectTitle: 'Diseño de Logo Corporativo'
    },
    {
      id: '2',
      participants: [
        { id: '1', name: 'Juan Pérez', avatar: null, role: 'client' },
        { id: '3', name: 'Carlos Ruiz', avatar: null, role: 'freelancer' }
      ],
      lastMessage: {
        text: 'Te envío los archivos solicitados',
        timestamp: new Date(2023, 5, 14, 10, 15),
        senderId: '3'
      },
      unreadCount: 0,
      projectId: '102',
      projectTitle: 'Desarrollo Web E-commerce'
    }
  ]);
  
  const [messages, setMessages] = useState([
    {
      id: '101',
      conversationId: '1',
      text: 'Hola, ¿cómo va el proyecto?',
      timestamp: new Date(2023, 5, 15, 14, 30),
      senderId: '1',
      status: 'read'
    },
    {
      id: '102',
      conversationId: '1',
      text: 'Va muy bien, estoy terminando los últimos detalles',
      timestamp: new Date(2023, 5, 15, 14, 35),
      senderId: '2',
      status: 'read'
    },
    {
      id: '103',
      conversationId: '1',
      text: 'Excelente, ¿para cuándo crees que estará listo?',
      timestamp: new Date(2023, 5, 15, 14, 40),
      senderId: '1',
      status: 'read'
    },
    {
      id: '104',
      conversationId: '1',
      text: 'Estimo que para el viernes de esta semana',
      timestamp: new Date(2023, 5, 15, 14, 45),
      senderId: '2',
      status: 'read'
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  // Detectar si estamos en vista móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 960);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Cargar conversaciones
  useEffect(() => {
    // dispatch(getConversations());
    console.log('Cargar conversaciones');
  }, [dispatch]);
  
  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (activeConversation) {
      // dispatch(getMessages(activeConversation.id));
      console.log('Cargar mensajes para la conversación:', activeConversation.id);
      
      // En móvil, ocultar la lista de conversaciones
      if (isMobileView) {
        setShowConversationList(false);
      }
    }
  }, [activeConversation, dispatch, isMobileView]);
  
  // Scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    // Simulación de envío de mensaje
    const newMsg = {
      id: Date.now().toString(),
      conversationId: activeConversation.id,
      text: newMessage,
      timestamp: new Date(),
      senderId: user.id,
      status: 'sent'
    };
    
    setMessages([...messages, newMsg]);
    
    // Actualizar la última conversación
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          lastMessage: {
            text: newMessage,
            timestamp: new Date(),
            senderId: user.id
          }
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    
    // dispatch(sendMessage({ conversationId: activeConversation.id, text: newMessage }));
    setNewMessage('');
  };
  
  const handleBackToList = () => {
    setShowConversationList(true);
  };
  
  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== user?.id);
    const projectTitle = conv.projectTitle || '';
    
    return (
      otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Filtrar por pestaña (Todos, No leídos)
  const tabFilteredConversations = tabValue === 0
    ? filteredConversations
    : filteredConversations.filter(conv => conv.unreadCount > 0);
  
  // Obtener el otro participante de la conversación
  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null;
    return conversation.participants.find(p => p.id !== user.id);
  };
  
  // Formatear fecha
  const formatMessageDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Si es hoy, mostrar solo la hora
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'HH:mm');
    }
    
    // Si es esta semana, mostrar el día
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(messageDate, 'EEEE', { locale: es });
    }
    
    // Si es este año, mostrar día y mes
    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, 'd MMM', { locale: es });
    }
    
    // Si es otro año, mostrar fecha completa
    return format(messageDate, 'd MMM yyyy', { locale: es });
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Centro de Mensajes
      </Typography>
      
      <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex', overflow: 'hidden' }}>
        {/* Lista de conversaciones */}
        {(!isMobileView || showConversationList) && (
          <Box 
            sx={{ 
              width: isMobileView ? '100%' : 320, 
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <TextField
                fullWidth
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ mt: 2 }}
                variant="fullWidth"
              >
                <Tab label="Todos" />
                <Tab 
                  label="No leídos" 
                  icon={
                    conversations.reduce((count, conv) => count + conv.unreadCount, 0) > 0 ? (
                      <Badge 
                        color="error" 
                        badgeContent={conversations.reduce((count, conv) => count + conv.unreadCount, 0)}
                        sx={{ ml: 1 }}
                      />
                    ) : null
                  }
                  iconPosition="end"
                />
              </Tabs>
            </Box>
            
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {tabFilteredConversations.length > 0 ? (
                tabFilteredConversations.map(conversation => {
                  const otherParticipant = getOtherParticipant(conversation);
                  
                  return (
                    <React.Fragment key={conversation.id}>
                      <ListItem 
                        button 
                        alignItems="flex-start"
                        selected={activeConversation?.id === conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        sx={{ 
                          bgcolor: conversation.unreadCount > 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(25, 118, 210, 0.12)',
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              conversation.unreadCount > 0 ? (
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                    border: '2px solid white'
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Avatar alt={otherParticipant?.name}>
                              {otherParticipant?.name.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                                  maxWidth: '70%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {otherParticipant?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatMessageDate(conversation.lastMessage.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ 
                                  display: 'inline',
                                  fontWeight: conversation.unreadCount > 0 ? 'medium' : 'normal',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {conversation.lastMessage.text}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {conversation.projectTitle}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron conversaciones
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        )}
        
        {/* Área de mensajes */}
        {(!isMobileView || !showConversationList) && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {activeConversation ? (
              <>
                {/* Cabecera de la conversación */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isMobileView && (
                    <IconButton edge="start" onClick={handleBackToList} sx={{ mr: 1 }}>
                      <ArrowBack />
                    </IconButton>
                  )}
                  
                  <Avatar sx={{ mr: 2 }}>
                    {getOtherParticipant(activeConversation)?.name.charAt(0)}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      {getOtherParticipant(activeConversation)?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeConversation.projectTitle}
                    </Typography>
                  </Box>
                  
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>
                
                {/* Lista de mensajes */}
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {messages
                    .filter(msg => msg.conversationId === activeConversation.id)
                    .map(message => {
                      const isCurrentUser = message.senderId === user?.id;
                      
                      return (
                        <Box
                          key={message.id}
                          sx={{
                            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            mb: 1
                          }}
                        >
                          <Box
                            className={`message-bubble ${isCurrentUser ? 'message-sent' : 'message-received'}`}
                          >
                            <Typography variant="body1">
                              {message.text}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            className="message-timestamp"
                          >
                            {format(new Date(message.timestamp), 'HH:mm')}
                          </Typography>
                        </Box>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Formulario para enviar mensajes */}
                <Box 
                  component="form" 
                  onSubmit={handleSendMessage}
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <AttachFile />
                  </IconButton>
                  
                  <TextField
                    fullWidth
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    variant="outlined"
                    size="small"
                    multiline
                    maxRows={4}
                    sx={{ mr: 1 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Send />}
                    type="submit"
                    disabled={!newMessage.trim()}
                  >
                    Enviar
                  </Button>
                </Box>
              </>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  p: 3
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Selecciona una conversación
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Elige una conversación de la lista para ver los mensajes
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MessageCenter;
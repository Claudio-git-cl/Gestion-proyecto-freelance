import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Send,
  AttachFile,
  MoreVert,
  Search
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getConversations,
  getMessages,
  sendMessage,
  setActiveConversation
} from '../redux/slices/messageSlice';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, messages, loading, error } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  
  // Cargar conversaciones al montar el componente
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);
  
  // Cargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (activeConversation) {
      dispatch(getMessages(activeConversation.id));
    }
  }, [dispatch, activeConversation]);
  
  // Desplazarse al último mensaje cuando se cargan nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversation) return;
    
    dispatch(sendMessage({
      conversationId: activeConversation.id,
      text: messageText
    }));
    
    setMessageText('');
  };
  
  const handleConversationSelect = (conversation) => {
    dispatch(setActiveConversation(conversation));
  };
  
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.id !== user.id);
  };
  
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'HH:mm', { locale: es });
  };
  
  const formatConversationTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm', { locale: es });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: es });
    }
  };
  
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    if (!otherParticipant) return false;
    
    return otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conv.lastMessage && conv.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  const currentMessages = activeConversation ? (messages[activeConversation.id] || []) : [];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mensajes
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Lista de conversaciones */}
          <Grid item xs={12} md={4} sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <TextField
                fullWidth
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <List sx={{ height: 'calc(100% - 70px)', overflow: 'auto' }}>
              {loading && conversations.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => {
                  const otherParticipant = getOtherParticipant(conversation);
                  if (!otherParticipant) return null;
                  
                  return (
                    <ListItem
                      key={conversation.id}
                      button
                      selected={activeConversation && activeConversation.id === conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      sx={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        bgcolor: conversation.unreadCount > 0 ? 'rgba(25, 118, 210, 0.05)' : 'inherit'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="primary"
                          variant="dot"
                          invisible={conversation.unreadCount === 0}
                        >
                          <Avatar>{otherParticipant.name.charAt(0)}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherParticipant.name}
                        secondary={
                          conversation.lastMessage ? (
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {conversation.lastMessage.text}
                            </Typography>
                          ) : 'Sin mensajes'
                        }
                        primaryTypographyProps={{
                          fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                        }}
                      />
                      {conversation.lastMessage && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatConversationTime(conversation.lastMessage.timestamp)}
                        </Typography>
                      )}
                    </ListItem>
                  );
                })
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
                  </Typography>
                </Box>
              )}
            </List>
          </Grid>
          
          {/* Área de mensajes */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {activeConversation ? (
              <>
                {/* Cabecera de la conversación */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>
                    {getOtherParticipant(activeConversation)?.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      {getOtherParticipant(activeConversation)?.name}
                    </Typography>
                    {activeConversation.project && (
                      <Typography variant="body2" color="text.secondary">
                        Proyecto: {activeConversation.project.title}
                      </Typography>
                    )}
                  </Box>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>
                
                {/* Mensajes */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
                  {loading && currentMessages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : currentMessages.length > 0 ? (
                    currentMessages.map((message, index) => {
                      const isCurrentUser = message.senderId === user.id;
                      const showAvatar = index === 0 || currentMessages[index - 1].senderId !== message.senderId;
                      
                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            mb: 1.5
                          }}
                        >
                          {!isCurrentUser && showAvatar && (
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                              {getOtherParticipant(activeConversation)?.name.charAt(0)}
                            </Avatar>
                          )}
                          
                          {!isCurrentUser && !showAvatar && <Box sx={{ width: 40 }} />}
                          
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isCurrentUser ? 'primary.main' : 'white',
                              color: isCurrentUser ? 'white' : 'text.primary',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Typography variant="body1">{message.text}</Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'right',
                                mt: 0.5,
                                color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                              }}
                            >
                              {formatMessageTime(message.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay mensajes. ¡Envía el primero!
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Formulario de envío de mensajes */}
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
                  <IconButton sx={{ mr: 1 }}>
                    <AttachFile />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="Escribe un mensaje..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    variant="outlined"
                    size="small"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ ml: 1 }}
                    disabled={!messageText.trim()}
                  >
                    <Send />
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  p: 3,
                  bgcolor: '#f5f5f5'
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
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MessagesPage;
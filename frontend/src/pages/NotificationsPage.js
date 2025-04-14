import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { fetchNotifications, markAsRead, markAllAsRead } from '../redux/slices/notificationsSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector(state => state.notifications);
  
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length > 0 ? (
          <Paper elevation={3}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      !notification.read && (
                        <IconButton 
                          edge="end" 
                          aria-label="marcar como leída"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )
                    }
                    sx={{
                      bgcolor: notification.read ? 'inherit' : 'action.hover',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${notification.type}.light` }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" component="span">
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip 
                              label="Nueva" 
                              color="primary" 
                              size="small" 
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No tienes notificaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las notificaciones sobre tus proyectos, facturas y mensajes aparecerán aquí.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default NotificationsPage;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment,
  AttachMoney,
  Message,
  Event,
  CheckCircle,
  MoreVert,
  DoneAll
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  useEffect(() => {
    dispatch(getNotifications());
    
    // Configurar intervalo para actualizar notificaciones
    const interval = setInterval(() => {
      dispatch(getNotifications());
    }, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (notification) => {
    // Marcar como leída
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    
    // Navegar a la página correspondiente
    switch (notification.type) {
      case 'project':
        navigate(`/projects/${notification.entityId}`);
        break;
      case 'invoice':
        navigate(`/invoices?id=${notification.entityId}`);
        break;
      case 'message':
        navigate(`/messages?id=${notification.entityId}`);
        break;
      case 'deadline':
        navigate(`/projects/${notification.entityId}`);
        break;
      default:
        navigate('/dashboard');
    }
    
    handleClose();
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
        return <Assignment color="primary" />;
      case 'invoice':
        return <AttachMoney color="success" />;
      case 'message':
        return <Message color="info" />;
      case 'deadline':
        return <Event color="warning" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };
  
  const getTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };
  
  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Marcar todas como leídas">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <DoneAll />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Cargando notificaciones...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.light' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" color="text.primary">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {getTimeAgo(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
                {!notification.read && (
                  <ListItemSecondaryAction>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'error.main'
                      }}
                    />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button size="small" onClick={handleClose}>
            Cerrar
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter;
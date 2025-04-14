import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemAvatar,
  Avatar,
  Divider, 
  Box, 
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  Assignment as ProjectIcon,
  Receipt as InvoiceIcon,
  Timer as TimeIcon,
  People as ClientIcon,
  Comment as CommentIcon,
  AttachMoney as PaymentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ActivityFeed = ({ activities = [], loading = false }) => {
  const theme = useTheme();

  // Función para formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Función para renderizar el icono según el tipo de actividad
  const renderIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'proyecto':
      case 'project':
        return <ProjectIcon />;
      case 'factura':
      case 'invoice':
        return <InvoiceIcon />;
      case 'tiempo':
      case 'time':
        return <TimeIcon />;
      case 'cliente':
      case 'client':
        return <ClientIcon />;
      case 'comentario':
      case 'comment':
        return <CommentIcon />;
      case 'pago':
      case 'payment':
        return <PaymentIcon />;
      case 'edición':
      case 'edit':
        return <EditIcon />;
      default:
        return <EditIcon />;
    }
  };

  // Función para obtener color según el tipo de actividad
  const getColorByType = (type) => {
    switch (type.toLowerCase()) {
      case 'proyecto':
      case 'project':
        return theme.palette.primary.main;
      case 'factura':
      case 'invoice':
        return theme.palette.success.main;
      case 'tiempo':
      case 'time':
        return theme.palette.warning.main;
      case 'cliente':
      case 'client':
        return theme.palette.info.main;
      case 'comentario':
      case 'comment':
        return theme.palette.secondary.main;
      case 'pago':
      case 'payment':
        return theme.palette.success.dark;
      case 'edición':
      case 'edit':
        return theme.palette.grey[700];
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Actividad Reciente
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        // Esqueleto de carga
        Array.from(new Array(5)).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            {index < 4 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))
      ) : activities.length > 0 ? (
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem 
                component={Link} 
                to={activity.link}
                sx={{ 
                  p: 1, 
                  borderRadius: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getColorByType(activity.type) }}>
                    {renderIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography variant="body1">
                      {activity.description}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {formatRelativeTime(activity.timestamp)}
                    </Typography>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay actividad reciente
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ActivityFeed;
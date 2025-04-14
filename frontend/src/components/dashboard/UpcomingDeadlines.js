import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Box, 
  Button, 
  Chip,
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  Event as EventIcon, 
  ArrowForward as ArrowForwardIcon,
  Assignment as ProjectIcon,
  Receipt as InvoiceIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const UpcomingDeadlines = ({ deadlines = [], loading = false }) => {
  const theme = useTheme();

  // Función para calcular días restantes
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(dateString);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función para renderizar el icono según el tipo
  const renderIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'proyecto':
      case 'project':
        return <ProjectIcon color="primary" />;
      case 'factura':
      case 'invoice':
        return <InvoiceIcon color="primary" />;
      default:
        return <EventIcon color="primary" />;
    }
  };

  // Función para renderizar los días restantes
  const renderDaysRemaining = (dateString) => {
    const days = getDaysRemaining(dateString);
    
    let color = 'default';
    if (days < 0) {
      color = 'error';
    } else if (days <= 3) {
      color = 'warning';
    } else if (days <= 7) {
      color = 'info';
    } else {
      color = 'success';
    }
    
    let label = '';
    if (days < 0) {
      label = `Vencido hace ${Math.abs(days)} días`;
    } else if (days === 0) {
      label = 'Vence hoy';
    } else if (days === 1) {
      label = 'Vence mañana';
    } else {
      label = `${days} días restantes`;
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Próximos Vencimientos
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        // Esqueleto de carga
        Array.from(new Array(3)).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            {index < 2 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))
      ) : deadlines.length > 0 ? (
        <List sx={{ flexGrow: 1, p: 0 }}>
          {deadlines.map((deadline, index) => (
            <React.Fragment key={deadline.id}>
              <ListItem 
                component={Link} 
                to={deadline.link}
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
                <ListItemIcon>
                  {renderIcon(deadline.type)}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {deadline.title}
                      </Typography>
                      {renderDaysRemaining(deadline.date)}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {deadline.type}: {new Date(deadline.date).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
              {index < deadlines.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes próximos vencimientos
          </Typography>
        </Box>
      )}
      
      {deadlines.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button 
            component={Link} 
            to="/calendar" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            Ver calendario completo
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default UpcomingDeadlines;
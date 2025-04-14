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
  Assignment as ProjectIcon, 
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const RecentProjects = ({ projects = [], loading = false }) => {
  const theme = useTheme();

  // Función para renderizar el estado del proyecto con un chip de color
  const renderStatus = (status) => {
    let color = 'default';
    
    switch (status.toLowerCase()) {
      case 'en progreso':
      case 'in progress':
        color = 'primary';
        break;
      case 'completado':
      case 'completed':
        color = 'success';
        break;
      case 'pausado':
      case 'paused':
        color = 'warning';
        break;
      case 'cancelado':
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Proyectos Recientes
        </Typography>
        <Button 
          component={Link} 
          to="/projects/new" 
          startIcon={<AddIcon />} 
          size="small"
        >
          Nuevo
        </Button>
      </Box>
      
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
      ) : projects.length > 0 ? (
        <List sx={{ flexGrow: 1, p: 0 }}>
          {projects.map((project, index) => (
            <React.Fragment key={project.id}>
              <ListItem 
                component={Link} 
                to={`/projects/${project.id}`}
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
                  <ProjectIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {project.name}
                      </Typography>
                      {renderStatus(project.status)}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {project.client} • Fecha límite: {new Date(project.deadline).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
              {index < projects.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No tienes proyectos recientes
          </Typography>
          <Button 
            component={Link} 
            to="/projects/new" 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2, alignSelf: 'center' }}
          >
            Crear nuevo proyecto
          </Button>
        </Box>
      )}
      
      {projects.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button 
            component={Link} 
            to="/projects" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            Ver todos los proyectos
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RecentProjects;
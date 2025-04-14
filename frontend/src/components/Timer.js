import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { timeEntryService, projectService } from '../services/api';

const Timer = () => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [projectMenuAnchorEl, setProjectMenuAnchorEl] = useState(null);
  
  useEffect(() => {
    fetchData();
    
    // Actualizar el temporizador cada segundo
    const interval = setInterval(() => {
      if (activeTimer) {
        const startTime = new Date(activeTimer.startTime).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setElapsed(elapsedSeconds);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los registros de tiempo
      const timeEntries = await timeEntryService.getAll();
      
      // Buscar el temporizador activo
      const active = timeEntries.find(entry => entry.endTime === null);
      setActiveTimer(active);
      
      if (active) {
        // Calcular el tiempo transcurrido
        const startTime = new Date(active.startTime).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setElapsed(elapsedSeconds);
      }
      
      // Obtener proyectos para el menú de inicio rápido
      const projectsData = await projectService.getAll();
      setProjects(projectsData.filter(p => 
        p.status === 'En progreso' || p.status === 'Pendiente'
      ));
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los datos del temporizador:', error);
      setLoading(false);
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProjectMenuOpen = (event) => {
    setProjectMenuAnchorEl(event.currentTarget);
    handleMenuClose();
  };
  
  const handleProjectMenuClose = () => {
    setProjectMenuAnchorEl(null);
  };
  
  const handleStartTimer = async (projectId) => {
    try {
      setLoading(true);
      await timeEntryService.startTimer(projectId);
      fetchData();
      handleProjectMenuClose();
    } catch (error) {
      console.error('Error al iniciar el temporizador:', error);
      setLoading(false);
    }
  };
  
  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    try {
      setLoading(true);
      await timeEntryService.stopTimer(activeTimer.projectId);
      setActiveTimer(null);
      setElapsed(0);
      handleMenuClose();
      setLoading(false);
    } catch (error) {
      console.error('Error al detener el temporizador:', error);
      setLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box>
      {activeTimer ? (
        <Button
          color="inherit"
          startIcon={<TimerIcon />}
          onClick={handleMenuOpen}
          sx={{ textTransform: 'none' }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {activeTimer.projectName}
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {formatTime(elapsed)}
              </Typography>
            </>
          )}
        </Button>
      ) : (
        <IconButton
          color="inherit"
          onClick={handleProjectMenuOpen}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <PlayIcon />}
        </IconButton>
      )}
      
      {/* Menú del temporizador activo */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">
            {activeTimer?.projectName}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="body2" fontFamily="monospace">
            {formatTime(elapsed)}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleStopTimer}>
          <ListItemIcon>
            <StopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detener temporizador</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to={activeTimer ? `/time-entries/${activeTimer.id}/edit` : '#'}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar entrada</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to={activeTimer ? `/projects/${activeTimer.projectId}` : '#'}
          onClick={handleMenuClose}
        >
          <ListItemText>Ver proyecto</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Menú para seleccionar proyecto e iniciar temporizador */}
      <Menu
        anchorEl={projectMenuAnchorEl}
        open={Boolean(projectMenuAnchorEl)}
        onClose={handleProjectMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">
            Iniciar temporizador
          </Typography>
        </MenuItem>
        <Divider />
        {projects.length > 0 ? (
          projects.map(project => (
            <MenuItem 
              key={project.id} 
              onClick={() => handleStartTimer(project.id)}
            >
              <ListItemText 
                primary={project.name} 
                secondary={project.clientName} 
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <ListItemText>No hay proyectos activos</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          component={RouterLink} 
          to="/time-entries/new"
          onClick={handleProjectMenuClose}
        >
          <ListItemText>Crear entrada manual</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Timer;
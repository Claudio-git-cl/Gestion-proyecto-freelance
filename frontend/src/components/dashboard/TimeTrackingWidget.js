import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Stop as StopIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const TimeTrackingWidget = ({ activeTracking, projects = [], onStart, onStop }) => {
  const theme = useTheme();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formattedTime, setFormattedTime] = useState('00:00:00');
  
  // Actualizar el tiempo transcurrido si hay un seguimiento activo
  useEffect(() => {
    let interval;
    
    if (activeTracking) {
      // Establecer los valores iniciales basados en el seguimiento activo
      setSelectedProject(activeTracking.projectId);
      setDescription(activeTracking.description || '');
      
      // Calcular el tiempo transcurrido inicial
      const startTime = new Date(activeTracking.startTime).getTime();
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(initialElapsed);
      
      // Actualizar el tiempo cada segundo
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Reiniciar valores cuando no hay seguimiento activo
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTracking]);
  
  // Formatear el tiempo transcurrido
  useEffect(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    setFormattedTime(formatted);
  }, [elapsedTime]);
  
  // Manejar inicio de seguimiento
  const handleStart = () => {
    if (selectedProject && onStart) {
      onStart(selectedProject, description);
    }
  };
  
  // Manejar detención de seguimiento
  const handleStop = () => {
    if (onStop) {
      onStop();
      setSelectedProject('');
      setDescription('');
    }
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Control de Tiempo
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {activeTracking ? (
        // Vista de seguimiento activo
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, flexGrow: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              mb: 2
            }}
          >
            <TimerIcon fontSize="large" />
          </Box>
          
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {formattedTime}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            {projects.find(p => p.id === activeTracking.projectId)?.name || 'Proyecto'}
          </Typography>
          
          {activeTracking.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              {activeTracking.description}
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStop}
            size="large"
          >
            Detener
          </Button>
        </Box>
      ) : (
        // Formulario para iniciar seguimiento
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <TextField
            select
            label="Proyecto"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={handleStart}
              fullWidth
              size="large"
              disabled={!selectedProject}
            >
              Iniciar Seguimiento
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TimeTrackingWidget;
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { format } from 'date-fns';

// Mock projects for development
const mockProjects = [
  { id: 1, name: 'Diseño de sitio web' },
  { id: 2, name: 'Desarrollo de aplicación móvil' },
  { id: 3, name: 'Mantenimiento de plataforma' },
];

const TimeTracker = ({ onSaveTimeEntry }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // In a real app, fetch projects from API
    setProjects(mockProjects);
  }, []);

  useEffect(() => {
    return () => {
      // Clean up timer on component unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!selectedProject) {
      alert('Por favor selecciona un proyecto');
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    
    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }
    
    timerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - (startTime || now) - pausedTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsPaused(true);
      setPausedTime(pausedTime + (Date.now() - (startTime + pausedTime)));
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      
      // Calculate hours with 2 decimal places
      const hours = parseFloat((elapsedTime / 3600).toFixed(2));
      
      // Create time entry
      const timeEntry = {
        projectId: selectedProject,
        description,
        date: format(new Date(), 'yyyy-MM-dd'),
        duration: hours
      };
      
      // Save time entry
      onSaveTimeEntry(timeEntry);
      
      // Reset tracker
      setIsTracking(false);
      setIsPaused(false);
      setElapsedTime(0);
      setStartTime(null);
      setPausedTime(0);
      setDescription('');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar tiempo
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined" disabled={isTracking}>
            <InputLabel id="project-select-label">Proyecto</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Proyecto"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Descripción"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isTracking && !isPaused}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontFamily: 'monospace', mr: 2 }}>
              {formatTime(elapsedTime)}
            </Typography>
            
            <Box>
              {!isTracking || isPaused ? (
                <IconButton 
                  color="primary" 
                  onClick={startTimer} 
                  size="large"
                  sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                >
                  <PlayArrowIcon />
                </IconButton>
              ) : (
                <IconButton 
                  color="warning" 
                  onClick={pauseTimer} 
                  size="large"
                  sx={{ backgroundColor: 'rgba(237, 108, 2, 0.1)' }}
                >
                  <PauseIcon />
                </IconButton>
              )}
              
              {(isTracking || elapsedTime > 0) && (
                <IconButton 
                  color="error" 
                  onClick={stopTimer} 
                  size="large" 
                  sx={{ ml: 1, backgroundColor: 'rgba(211, 47, 47, 0.1)' }}
                >
                  <StopIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isTracking && (
              <Typography variant="body2" color="text.secondary">
                Iniciado: {startTime ? format(new Date(startTime), 'HH:mm:ss') : ''}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TimeTracker;
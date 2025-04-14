import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { projectService, timeEntryService } from '../../services/api';

const TimeTracker = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    fetchProjects();
    
    // Check if there's an active timer in localStorage
    const activeTimer = JSON.parse(localStorage.getItem('activeTimer'));
    if (activeTimer) {
      const { projectId, description, startTime: storedStartTime } = activeTimer;
      setFormData(prev => ({
        ...prev,
        projectId,
        description
      }));
      
      const start = new Date(storedStartTime);
      setStartTime(start);
      setIsTracking(true);
      
      // Calculate elapsed time
      const now = new Date();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
      
      // Start timer
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      setTimerInterval(interval);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data.filter(project => project.status === 'active'));
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los proyectos');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStartTimer = () => {
    if (!formData.projectId) {
      setError('Por favor, selecciona un proyecto');
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    setElapsedTime(0);
    
    // Start timer
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
    
    // Save to localStorage
    localStorage.setItem('activeTimer', JSON.stringify({
      projectId: formData.projectId,
      description: formData.description,
      startTime: now.toISOString()
    }));
    
    setError('');
    setSuccess('Temporizador iniciado');
  };
  
  const handleStopTimer = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsTracking(false);
    
    // Calculate duration in minutes
    const durationMinutes = Math.floor(elapsedTime / 60);
    
    try {
      setLoading(true);
      
      // Create time entry
      await timeEntryService.create({
        projectId: formData.projectId,
        description: formData.description,
        date: formData.date,
        startTime: startTime.toISOString(),
        durationMinutes
      });
      
      // Clear localStorage
      localStorage.removeItem('activeTimer');
      
      setSuccess('Tiempo registrado correctamente');
      setFormData(prev => ({
        ...prev,
        description: ''
      }));
      setStartTime(null);
      setElapsedTime(0);
      setLoading(false);
    } catch (err) {
      setError('Error al guardar el registro de tiempo');
      setLoading(false);
    }
  };
  
  const handleDiscardTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    
    // Clear localStorage
    localStorage.removeItem('activeTimer');
    
    setSuccess('Temporizador descartado');
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Seguimiento de Tiempo
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isTracking || loading}>
                <InputLabel id="project-select-label">Proyecto *</InputLabel>
                <Select
                  labelId="project-select-label"
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label="Proyecto *"
                  required
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name} ({project.client?.name || 'Sin cliente'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isTracking || loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={2}
                placeholder="¿En qué estás trabajando?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 3 }}>
                <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace', mb: 3 }}>
                  {formatTime(elapsedTime)}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {!isTracking ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayIcon />}
                      onClick={handleStartTimer}
                      disabled={loading || !formData.projectId}
                      size="large"
                    >
                      Iniciar
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={handleStopTimer}
                        disabled={loading}
                        size="large"
                      >
                        Detener
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDiscardTimer}
                        disabled={loading}
                      >
                        Descartar
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default TimeTracker;
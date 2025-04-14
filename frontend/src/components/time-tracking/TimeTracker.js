import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { startTimeTracking, stopTimeTracking } from '../../redux/slices/timeTrackingSlice';

const TimeTracker = ({ projects = [] }) => {
  const dispatch = useDispatch();
  const { activeTracking, loading } = useSelector(state => state.timeTracking);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Efecto para manejar el temporizador
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedTime(prevElapsed => prevElapsed + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRunning]);
  
  // Efecto para cargar el seguimiento activo si existe
  useEffect(() => {
    if (activeTracking) {
      setSelectedProject(activeTracking.projectId);
      setDescription(activeTracking.description);
      setIsRunning(true);
      
      const startTime = new Date(activeTracking.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      setElapsedTime(elapsed);
      startTimeRef.current = now - (elapsed * 1000);
    }
  }, [activeTracking]);
  
  // Iniciar el seguimiento de tiempo
  const handleStart = () => {
    if (!selectedProject) {
      alert('Por favor, selecciona un proyecto');
      return;
    }
    
    startTimeRef.current = new Date().getTime();
    setIsRunning(true);
    
    dispatch(startTimeTracking({
      projectId: selectedProject,
      description: description
    }));
  };
  
  // Detener el seguimiento de tiempo
  const handleStop = () => {
    setIsRunning(false);
    
    dispatch(stopTimeTracking())
      .then(() => {
        // Reiniciar el formulario
        setSelectedProject('');
        setDescription('');
        setElapsedTime(0);
      });
  };
  
  // Abrir diálogo de descarte
  const handleOpenDiscardDialog = () => {
    setDiscardDialogOpen(true);
  };
  
  // Cerrar diálogo de descarte
  const handleCloseDiscardDialog = () => {
    setDiscardDialogOpen(false);
  };
  
  // Descartar el seguimiento de tiempo
  const handleDiscard = () => {
    setIsRunning(false);
    setSelectedProject('');
    setDescription('');
    setElapsedTime(0);
    handleCloseDiscardDialog();
    
    // Aquí se podría agregar lógica para cancelar el seguimiento en el backend
  };
  
  // Formatear el tiempo transcurrido
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Control de Tiempo
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="project-select-label">Proyecto</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProject}
            label="Proyecto"
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={isRunning}
          >
            <MenuItem value="">
              <em>Selecciona un proyecto</em>
            </MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Descripción"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isRunning}
          placeholder="¿En qué estás trabajando?"
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace', mr: 2 }}>
            {formatElapsedTime(elapsedTime)}
          </Typography>
          
          {isRunning && (
            <Chip 
              label="En progreso" 
              color="primary" 
              size="small"
              sx={{ animation: 'pulse 2s infinite' }}
            />
          )}
        </Box>
        
        <Box>
          {!isRunning ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={handleStart}
              disabled={loading || !selectedProject}
            >
              Iniciar
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStop}
              disabled={loading}
            >
              Detener
            </Button>
          )}
          
          {isRunning && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDiscardDialog}
              sx={{ ml: 2 }}
              disabled={loading}
            >
              Descartar
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Diálogo de confirmación para descartar */}
      <Dialog
        open={discardDialogOpen}
        onClose={handleCloseDiscardDialog}
      >
        <DialogTitle>Descartar Seguimiento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas descartar este seguimiento de tiempo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscardDialog}>
            Cancelar
          </Button>
          <Button onClick={handleDiscard} color="error" autoFocus>
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TimeTracker;
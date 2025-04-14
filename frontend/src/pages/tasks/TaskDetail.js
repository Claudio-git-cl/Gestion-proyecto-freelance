import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  Flag as FlagIcon,
  Notes as NotesIcon,
  Timer as TimerIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { taskService, timeEntryService } from '../../services/api';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [activeTimer, setActiveTimer] = useState(null);
  
  useEffect(() => {
    fetchTaskData();
  }, [id]);
  
  const fetchTaskData = async () => {
    try {
      setLoading(true);
      
      // Fetch task details
      const taskData = await taskService.getById(id);
      setTask(taskData);
      setNewStatus(taskData.status || 'Pendiente');
      
      // Fetch time entries for this task
      // This is a placeholder - you would need to implement this endpoint
      // const timeEntriesData = await timeEntryService.getByTaskId(id);
      // setTimeEntries(timeEntriesData);
      
      // Check if there's an active timer for this task
      // This is a placeholder - you would need to implement this endpoint
      // const activeTimerData = await timeEntryService.getActiveTimer(id);
      // if (activeTimerData) {
      //   setActiveTimer(activeTimerData);
      // }
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos de la tarea: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.name}"? Esta acción no se puede deshacer.`)) {
      try {
        setLoading(true);
        await taskService.delete(id);
        navigate('/tasks');
      } catch (err) {
        setError('Error al eliminar la tarea: ' + (err.message || 'Inténtalo de nuevo'));
        setLoading(false);
      }
    }
  };
  
  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
  };
  
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };
  
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };
  
  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      await taskService.updateStatus(id, newStatus);
      
      // Update local state
      setTask(prev => ({
        ...prev,
        status: newStatus
      }));
      
      setStatusDialogOpen(false);
      setLoading(false);
    } catch (err) {
      setError('Error al actualizar el estado: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleStartTimer = async () => {
    try {
      setLoading(true);
      const response = await timeEntryService.startTimer(task.projectId, id);
      setActiveTimer(response);
      setLoading(false);
    } catch (err) {
      setError('Error al iniciar el temporizador: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    try {
      setLoading(true);
      await timeEntryService.stopTimer(activeTimer.id);
      setActiveTimer(null);
      
      // Refresh time entries
      // const timeEntriesData = await timeEntryService.getByTaskId(id);
      // setTimeEntries(timeEntriesData);
      
      setLoading(false);
    } catch (err) {
      setError('Error al detener el temporizador: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'En progreso':
        return 'primary';
      case 'Pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'error';
      case 'Media':
        return 'warning';
      case 'Baja':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading && !task) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!task) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Tarea no encontrada o ha sido eliminada.
          </Alert>
          <Button
            component={RouterLink}
            to="/tasks"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Volver a la lista de tareas
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={RouterLink}
            to="/tasks"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {task.name}
          </Typography>
          <Box>
            <Tooltip title="Editar tarea">
              <IconButton
                component={RouterLink}
                to={`/tasks/${id}/edit`}
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar tarea">
              <IconButton color="error" onClick={handleDeleteTask}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Información de la Tarea
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {task.project && (
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Proyecto"
                      secondary={
                        <RouterLink to={`/projects/${task.project.id}`} style={{ textDecoration: 'none' }}>
                          {task.project.name}
                        </RouterLink>
                      }
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon>
                    <FlagIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prioridad"
                    secondary={
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                
                {task.dueDate && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarTodayIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Fecha límite"
                      secondary={new Date(task.dueDate).toLocaleDateString()}
                    />
                  </ListItem>
                )}
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Estado:</Typography>
                  <Button size="small" onClick={handleOpenStatusDialog}>
                    Cambiar
                  </Button>
                </Box>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  sx={{ width: '100%' }}
                />
              </Box>
              
              {task.description && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Descripción
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                </>
              )}
              
              {task.notes && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Notas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex' }}>
                    <NotesIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {task.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Registro de Tiempo
                </Typography>
                <Box>
                  {activeTimer ? (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={handleStopTimer}
                      disabled={loading}
                    >
                      Detener
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleStartTimer}
                      disabled={loading || task.status === 'Completada'}
                    >
                      Iniciar Temporizador
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {activeTimer && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                  <Typography variant="subtitle1">
                    Temporizador activo
                  </Typography>
                  <Typography variant="body2">
                    Iniciado: {new Date(activeTimer.startTime).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
              
              {timeEntries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <TimerIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay registros de tiempo para esta tarea.
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/time-entries/new?taskId=${id}`}
                    variant="outlined"
                    sx={{ mt: 2 }}
                    startIcon={<TimerIcon />}
                  >
                    Registrar Tiempo Manualmente
                  </Button>
                </Box>
              ) : (
                <>
                  <List dense>
                    {timeEntries.map((entry) => (
                      <ListItem
                        key={entry.id}
                        secondaryAction={
                          <IconButton
                            component={RouterLink}
                            to={`/time-entries/${entry.id}/edit`}
                            edge="end"
                            aria-label="edit"
                          >
                            <EditIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <TimerIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={entry.description || 'Sin descripción'}
                          secondary={`${new Date(entry.date).toLocaleDateString()} - ${formatDuration(entry.duration)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button
                      component={RouterLink}
                      to={`/time-entries/new?taskId=${id}`}
                      variant="outlined"
                      size="small"
                      startIcon={<TimerIcon />}
                    >
                      Registrar Más Tiempo
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Cambiar Estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecciona el nuevo estado de la tarea.
          </DialogContentText>
          <TextField
            select
            fullWidth
            label="Estado"
            value={newStatus}
            onChange={handleStatusChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="En progreso">En progreso</MenuItem>
            <MenuItem value="Completada">Completada</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancelar</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Actualizar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetail;
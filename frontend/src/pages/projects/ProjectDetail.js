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
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Slider,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Notes as NotesIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { projectService } from '../../services/api';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  useEffect(() => {
    fetchProjectData();
  }, [id]);
  
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectData = await projectService.getById(id);
      setProject(projectData);
      setNewProgress(projectData.progress || 0);
      setNewStatus(projectData.status || 'En progreso');
      
      // Fetch project tasks
      const tasksData = await projectService.getTasks(id);
      setTasks(tasksData);
      
      // Fetch project time entries
      const timeEntriesData = await projectService.getTimeEntries(id);
      setTimeEntries(timeEntriesData);
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del proyecto: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleDeleteProject = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
      try {
        setLoading(true);
        await projectService.delete(id);
        navigate('/projects');
      } catch (err) {
        setError('Error al eliminar el proyecto: ' + (err.message || 'Inténtalo de nuevo'));
        setLoading(false);
      }
    }
  };
  
  const handleOpenProgressDialog = () => {
    setProgressDialogOpen(true);
  };
  
  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
  };
  
  const handleProgressChange = (event, newValue) => {
    setNewProgress(newValue);
  };
  
  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      await projectService.updateProgress(id, newProgress);
      
      // Update local state
      setProject(prev => ({
        ...prev,
        progress: newProgress
      }));
      
      setProgressDialogOpen(false);
      setLoading(false);
    } catch (err) {
      setError('Error al actualizar el progreso: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
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
      await projectService.updateStatus(id, newStatus);
      
      // Update local state
      setProject(prev => ({
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
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso':
        return 'primary';
      case 'Completado':
        return 'success';
      case 'En pausa':
        return 'warning';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading && !project) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!project) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Proyecto no encontrado o ha sido eliminado.
          </Alert>
          <Button
            component={RouterLink}
            to="/projects"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Volver a la lista de proyectos
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
            to="/projects"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {project.name}
          </Typography>
          <Box>
            <Tooltip title="Editar proyecto">
              <IconButton
                component={RouterLink}
                to={`/projects/${id}/edit`}
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar proyecto">
              <IconButton color="error" onClick={handleDeleteProject}>
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
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Información del Proyecto
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {project.client && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cliente"
                      secondary={
                        <RouterLink to={`/clients/${project.client.id}`} style={{ textDecoration: 'none' }}>
                          {project.client.name}
                        </RouterLink>
                      }
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de inicio"
                    secondary={new Date(project.startDate).toLocaleDateString()}
                  />
                </ListItem>
                
                {project.endDate && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarTodayIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Fecha de finalización"
                      secondary={new Date(project.endDate).toLocaleDateString()}
                    />
                  </ListItem>
                )}
                
                {project.budget && (
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoneyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Presupuesto"
                      secondary={`$${project.budget.toFixed(2)}`}
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
                  label={project.status}
                  color={getStatusColor(project.status)}
                  sx={{ width: '100%' }}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Progreso: {project.progress || 0}%</Typography>
                  <Button size="small" onClick={handleOpenProgressDialog}>
                    Actualizar
                  </Button>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress || 0} 
                  color={
                    project.progress >= 100 ? 'success' :
                    project.progress > 50 ? 'primary' :
                    project.progress > 25 ? 'warning' : 'error'
                  }
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              
              {project.notes && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Notas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex' }}>
                    <NotesIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Tareas" icon={<AssignmentIcon />} iconPosition="start" />
                <Tab label="Tiempo" icon={<TimerIcon />} iconPosition="start" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Tareas del Proyecto
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/tasks/new?projectId=${id}`}
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                  >
                    Nueva Tarea
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : tasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Este proyecto no tiene tareas registradas.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/tasks/new?projectId=${id}`}
                      variant="outlined"
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                    >
                      Crear Primera Tarea
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {tasks.map((task) => (
                      <Grid item xs={12} key={task.id}>
                        <Card>
                          <CardHeader
                            title={task.name}
                            subheader={`Prioridad: ${task.priority}`}
                            action={
                              <Box>
                                <Tooltip title="Editar">
                                  <IconButton
                                    component={RouterLink}
                                    to={`/tasks/${task.id}/edit`}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  {task.description}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <Chip 
                                    label={task.status}
                                    color={
                                      task.status === 'Completada' ? 'success' :
                                      task.status === 'En progreso' ? 'primary' :
                                      task.status === 'Pendiente' ? 'warning' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Registro de Tiempo
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/time-entries/new?projectId=${id}`}
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                  >
                    Registrar Tiempo
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : timeEntries.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Este proyecto no tiene registros de tiempo.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/time-entries/new?projectId=${id}`}
                      variant="outlined"
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                    >
                      Registrar Primer Tiempo
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {timeEntries.map((entry) => (
                      <Grid item xs={12} key={entry.id}>
                        <Card>
                          <CardHeader
                            title={entry.description || 'Sin descripción'}
                            subheader={`${new Date(entry.date).toLocaleDateString()} - ${formatDuration(entry.duration)}`}
                            action={
                              <Box>
                                <Tooltip title="Editar">
                                  <IconButton
                                    component={RouterLink}
                                    to={`/time-entries/${entry.id}/edit`}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Progress Update Dialog */}
      <Dialog open={progressDialogOpen} onClose={handleCloseProgressDialog}>
        <DialogTitle>Actualizar Progreso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mueve el deslizador para actualizar el progreso del proyecto.
          </DialogContentText>
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Progreso: {newProgress}%
            </Typography>
            <Slider
              value={newProgress}
              onChange={handleProgressChange}
              aria-labelledby="progress-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgressDialog}>Cancelar</Button>
          <Button onClick={handleUpdateProgress} variant="contained">Actualizar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Cambiar Estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecciona el nuevo estado del proyecto.
          </DialogContentText>
          <TextField
            select
            fullWidth
            label="Estado"
            value={newStatus}
            onChange={handleStatusChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value="En progreso">En progreso</MenuItem>
            <MenuItem value="Completado">Completado</MenuItem>
            <MenuItem value="En pausa">En pausa</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem>
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

export default ProjectDetail;
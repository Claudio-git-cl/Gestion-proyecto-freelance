import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { timeEntryService, projectService, taskService } from '../../services/api';

const TimeEntryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    description: '',
    date: new Date(),
    duration: 60, // Default to 1 hour in minutes
    notes: ''
  });
  
  useEffect(() => {
    fetchProjects();
    
    if (isEditMode) {
      fetchTimeEntry();
    } else {
      // Check if projectId or taskId is provided in URL query params
      const queryParams = new URLSearchParams(location.search);
      const projectId = queryParams.get('projectId');
      const taskId = queryParams.get('taskId');
      
      if (projectId) {
        setFormData(prev => ({
          ...prev,
          projectId
        }));
        
        if (projectId) {
          fetchTasksByProject(projectId);
        }
      }
      
      if (taskId) {
        setFormData(prev => ({
          ...prev,
          taskId
        }));
        
        fetchTaskDetails(taskId);
      }
    }
  }, [id, location]);
  
  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError('Error al cargar los proyectos: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const fetchTasksByProject = async (projectId) => {
    try {
      const data = await projectService.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError('Error al cargar las tareas: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const fetchTaskDetails = async (taskId) => {
    try {
      const data = await taskService.getById(taskId);
      if (data.projectId && !formData.projectId) {
        setFormData(prev => ({
          ...prev,
          projectId: data.projectId
        }));
        
        fetchTasksByProject(data.projectId);
      }
    } catch (err) {
      setError('Error al cargar los detalles de la tarea: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const fetchTimeEntry = async () => {
    try {
      setInitialLoading(true);
      const data = await timeEntryService.getById(id);
      
      setFormData({
        projectId: data.projectId || '',
        taskId: data.taskId || '',
        description: data.description || '',
        date: data.date ? new Date(data.date) : new Date(),
        duration: data.duration || 60,
        notes: data.notes || ''
      });
      
      if (data.projectId) {
        fetchTasksByProject(data.projectId);
      }
      
      setInitialLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del registro de tiempo: ' + (err.message || 'Inténtalo de nuevo'));
      setInitialLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };
  
  const handleProjectChange = (event, newValue) => {
    const newProjectId = newValue ? newValue.id : '';
    
    setFormData(prev => ({
      ...prev,
      projectId: newProjectId,
      taskId: '' // Reset task when project changes
    }));
    
    if (newProjectId) {
      fetchTasksByProject(newProjectId);
    } else {
      setTasks([]);
    }
  };
  
  const handleTaskChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      taskId: newValue ? newValue.id : ''
    }));
  };
  
  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setFormData(prev => ({
        ...prev,
        duration: value
      }));
    }
  };
  
  const validateForm = () => {
    if (!formData.projectId) {
      setError('El proyecto es obligatorio');
      return false;
    }
    
    if (!formData.date) {
      setError('La fecha es obligatoria');
      return false;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      setError('La duración debe ser mayor que cero');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        await timeEntryService.update(id, formData);
      } else {
        await timeEntryService.create(formData);
      }
      
      navigate('/time-entries');
    } catch (err) {
      setError(`Error al ${isEditMode ? 'actualizar' : 'crear'} el registro de tiempo: ` + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
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
            to="/time-entries"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Editar Registro de Tiempo' : 'Nuevo Registro de Tiempo'}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Básica
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="project-select"
                  options={projects}
                  getOptionLabel={(option) => option.name}
                  value={projects.find(project => project.id === formData.projectId) || null}
                  onChange={handleProjectChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Proyecto *"
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <AssignmentIcon />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="task-select"
                  options={tasks}
                  getOptionLabel={(option) => option.name}
                  value={tasks.find(task => task.id === formData.taskId) || null}
                  onChange={handleTaskChange}
                  disabled={!formData.projectId || tasks.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tarea"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <AssignmentIcon />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Tiempo
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha *"
                    value={formData.date}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duración (minutos) *"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleDurationChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimerIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Ingresa la duración en minutos (ej. 60 para 1 hora)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Notas Adicionales
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/time-entries"
                  variant="outlined"
                  sx={{ mr: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Guardar Cambios' : 'Registrar Tiempo'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TimeEntryForm;
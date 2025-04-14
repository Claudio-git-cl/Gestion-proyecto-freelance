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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { taskService, projectService } from '../../services/api';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    status: 'Pendiente',
    priority: 'Media',
    dueDate: null,
    notes: ''
  });
  
  useEffect(() => {
    fetchProjects();
    
    if (isEditMode) {
      fetchTask();
    } else {
      // Check if projectId is provided in URL query params
      const queryParams = new URLSearchParams(location.search);
      const projectId = queryParams.get('projectId');
      
      if (projectId) {
        setFormData(prev => ({
          ...prev,
          projectId
        }));
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
  
  const fetchTask = async () => {
    try {
      setInitialLoading(true);
      const data = await taskService.getById(id);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        projectId: data.projectId || '',
        status: data.status || 'Pendiente',
        priority: data.priority || 'Media',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || ''
      });
      setInitialLoading(false);
    } catch (err) {
      setError('Error al cargar los datos de la tarea: ' + (err.message || 'Inténtalo de nuevo'));
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
      dueDate: date
    }));
  };
  
  const handleProjectChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      projectId: newValue ? newValue.id : ''
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre de la tarea es obligatorio');
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
        await taskService.update(id, formData);
      } else {
        await taskService.create(formData);
      }
      
      navigate('/tasks');
    } catch (err) {
      setError(`Error al ${isEditMode ? 'actualizar' : 'crear'} la tarea: ` + (err.message || 'Inténtalo de nuevo'));
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
            to="/tasks"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la Tarea *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    ),
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
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
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
                      label="Proyecto"
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha límite"
                    value={formData.dueDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
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
                <FormControl fullWidth>
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    label="Estado"
                    onChange={handleChange}
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En progreso">En progreso</MenuItem>
                    <MenuItem value="Completada">Completada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Prioridad</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    label="Prioridad"
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <FlagIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Baja">Baja</MenuItem>
                    <MenuItem value="Media">Media</MenuItem>
                    <MenuItem value="Alta">Alta</MenuItem>
                  </Select>
                </FormControl>
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
                  to="/tasks"
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
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Guardar Cambios' : 'Crear Tarea'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TaskForm;
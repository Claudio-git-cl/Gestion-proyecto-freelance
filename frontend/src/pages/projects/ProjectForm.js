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
  Slider,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { projectService, clientService } from '../../services/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: new Date(),
    endDate: null,
    budget: '',
    status: 'En progreso',
    progress: 0,
    notes: ''
  });
  
  useEffect(() => {
    fetchClients();
    
    if (isEditMode) {
      fetchProject();
    } else {
      // Check if clientId is provided in URL query params
      const queryParams = new URLSearchParams(location.search);
      const clientId = queryParams.get('clientId');
      
      if (clientId) {
        setFormData(prev => ({
          ...prev,
          clientId
        }));
      }
    }
  }, [id, location]);
  
  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      setError('Error al cargar los clientes: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const fetchProject = async () => {
    try {
      setInitialLoading(true);
      const data = await projectService.getById(id);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        clientId: data.clientId || '',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || '',
        status: data.status || 'En progreso',
        progress: data.progress || 0,
        notes: data.notes || ''
      });
      setInitialLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del proyecto: ' + (err.message || 'Inténtalo de nuevo'));
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
  
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  const handleClientChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      clientId: newValue ? newValue.id : ''
    }));
  };
  
  const handleProgressChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      progress: newValue
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre del proyecto es obligatorio');
      return false;
    }
    
    if (!formData.startDate) {
      setError('La fecha de inicio es obligatoria');
      return false;
    }
    
    if (formData.endDate && formData.startDate > formData.endDate) {
      setError('La fecha de finalización debe ser posterior a la fecha de inicio');
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
      
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null
      };
      
      if (isEditMode) {
        await projectService.update(id, projectData);
      } else {
        await projectService.create(projectData);
      }
      
      navigate('/projects');
    } catch (err) {
      setError(`Error al ${isEditMode ? 'actualizar' : 'crear'} el proyecto: ` + (err.message || 'Inténtalo de nuevo'));
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
            to="/projects"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto'}
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
                  label="Nombre del Proyecto *"
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
                  id="client-select"
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={clients.find(client => client.id === formData.clientId) || null}
                  onChange={handleClientChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <BusinessIcon />
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
                    <MenuItem value="En progreso">En progreso</MenuItem>
                    <MenuItem value="Completado">Completado</MenuItem>
                    <MenuItem value="En pausa">En pausa</MenuItem>
                    <MenuItem value="Cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Fechas y Presupuesto
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha de Inicio *"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha de Finalización"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
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
                <TextField
                  fullWidth
                  label="Presupuesto"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Progreso: {formData.progress}%
                </Typography>
                <Slider
                  value={formData.progress}
                  onChange={handleProgressChange}
                  aria-labelledby="progress-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Información Adicional
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
                  to="/projects"
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
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Guardar Cambios' : 'Crear Proyecto'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectForm;
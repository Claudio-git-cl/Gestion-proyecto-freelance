import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, updateProject } from '../../redux/slices/projectSlice';
import { fetchClients } from '../../redux/slices/clientSlice';

const ProjectDialog = ({ open, onClose, project }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.projects);
  const { clients } = useSelector(state => state.clients);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'active',
    deadline: null,
    budget: '',
    hourlyRate: '',
    estimatedHours: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);
  
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        status: project.status || 'active',
        deadline: project.deadline ? new Date(project.deadline) : null,
        budget: project.budget || '',
        hourlyRate: project.hourlyRate || '',
        estimatedHours: project.estimatedHours || ''
      });
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'active',
        deadline: null,
        budget: '',
        hourlyRate: '',
        estimatedHours: ''
      });
    }
    
    setErrors({});
  }, [project, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deadline: date
    });
    
    // Clear error when field is edited
    if (errors.deadline) {
      setErrors({
        ...errors,
        deadline: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es obligatorio';
    }
    
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'El presupuesto debe ser un número válido';
    }
    
    if (formData.hourlyRate && isNaN(parseFloat(formData.hourlyRate))) {
      newErrors.hourlyRate = 'La tarifa por hora debe ser un número válido';
    }
    
    if (formData.estimatedHours && isNaN(parseFloat(formData.estimatedHours))) {
      newErrors.estimatedHours = 'Las horas estimadas deben ser un número válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      const projectData = {
        ...formData,
        deadline: formData.deadline ? formData.deadline.toISOString() : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null
      };
      
      if (project) {
        dispatch(updateProject({
          projectId: project.id,
          projectData
        }));
      } else {
        dispatch(addProject(projectData));
      }
      
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Proyecto"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    label="Cliente"
                  >
                    <MenuItem value="">Sin cliente</MenuItem>
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Estado"
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="paused">En pausa</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha límite"
                  value={formData.deadline}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.deadline}
                      helperText={errors.deadline}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Presupuesto"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  error={!!errors.budget}
                  helperText={errors.budget}
                  InputProps={{
                    startAdornment: '€',
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tarifa por hora"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  error={!!errors.hourlyRate}
                  helperText={errors.hourlyRate}
                  InputProps={{
                    startAdornment: '€/h',
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horas estimadas"
                  name="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  error={!!errors.estimatedHours}
                  helperText={errors.estimatedHours}
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
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : project ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
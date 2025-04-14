import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Simulación de datos para desarrollo
const mockClients = [
  { id: 1, name: 'Juan Pérez', company: 'Empresa A' },
  { id: 2, name: 'María López', company: 'Empresa B' },
  { id: 3, name: 'Carlos Rodríguez', company: 'Empresa C' },
];

const validationSchema = Yup.object({
  name: Yup.string().required('El nombre es obligatorio'),
  clientId: Yup.number().required('El cliente es obligatorio'),
  startDate: Yup.date().required('La fecha de inicio es obligatoria'),
  endDate: Yup.date().min(
    Yup.ref('startDate'),
    'La fecha de finalización debe ser posterior a la fecha de inicio'
  ),
  budget: Yup.number().positive('El presupuesto debe ser positivo'),
  status: Yup.string().required('El estado es obligatorio')
});

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // En un entorno real, aquí llamaríamos al servicio
    // getClients().then(data => setClients(data));
    setClients(mockClients);
  }, []);

  const formik = useFormik({
    initialValues: {
      name: project?.name || '',
      description: project?.description || '',
      clientId: project?.clientId || '',
      startDate: project?.startDate || null,
      endDate: project?.endDate || null,
      budget: project?.budget || '',
      status: project?.status || 'pending'
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Nombre del proyecto"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.clientId && Boolean(formik.errors.clientId)}
              >
                <InputLabel id="client-label">Cliente</InputLabel>
                <Select
                  labelId="client-label"
                  id="clientId"
                  name="clientId"
                  value={formik.values.clientId}
                  onChange={formik.handleChange}
                  label="Cliente"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.clientId && formik.errors.clientId && (
                  <FormHelperText>{formik.errors.clientId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de inicio"
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                    helperText={formik.touched.startDate && formik.errors.startDate}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de finalización"
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                    helperText={formik.touched.endDate && formik.errors.endDate}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="budget"
                name="budget"
                label="Presupuesto"
                type="number"
                value={formik.values.budget}
                onChange={formik.handleChange}
                error={formik.touched.budget && Boolean(formik.errors.budget)}
                helperText={formik.touched.budget && formik.errors.budget}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Estado"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descripción"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  {project ? 'Actualizar' : 'Crear'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProjectForm;
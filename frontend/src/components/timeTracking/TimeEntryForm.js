import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Mock projects for development
const mockProjects = [
  { id: 1, name: 'Diseño de sitio web' },
  { id: 2, name: 'Desarrollo de aplicación móvil' },
  { id: 3, name: 'Mantenimiento de plataforma' },
];

const TimeEntryForm = ({ timeEntry, open, onClose, onSave }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // In a real app, fetch projects from API
    setProjects(mockProjects);
  }, []);

  const validationSchema = Yup.object({
    projectId: Yup.number().required('El proyecto es obligatorio'),
    description: Yup.string().required('La descripción es obligatoria'),
    date: Yup.date().required('La fecha es obligatoria'),
    duration: Yup.number()
      .positive('La duración debe ser positiva')
      .required('La duración es obligatoria'),
    billable: Yup.boolean(),
    hourlyRate: Yup.number().when('billable', {
      is: true,
      then: Yup.number()
        .positive('La tarifa debe ser positiva')
        .required('La tarifa es obligatoria'),
      otherwise: Yup.number().nullable()
    })
  });

  const formik = useFormik({
    initialValues: {
      id: timeEntry?.id || null,
      projectId: timeEntry?.projectId || '',
      description: timeEntry?.description || '',
      date: timeEntry?.date ? new Date(timeEntry.date) : new Date(),
      duration: timeEntry?.duration || '',
      billable: timeEntry?.billable !== undefined ? timeEntry.billable : true,
      hourlyRate: timeEntry?.hourlyRate || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Calculate amount if billable
      const amount = values.billable ? values.hourlyRate * values.duration : 0;
      
      // Get project name
      const project = projects.find(p => p.id === values.projectId);
      
      onSave({
        ...values,
        projectName: project ? project.name : '',
        amount
      });
      
      onClose();
    }
  });

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {timeEntry ? 'Editar entrada de tiempo' : 'Nueva entrada de tiempo'}
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" error={formik.touched.projectId && Boolean(formik.errors.projectId)}>
                <InputLabel id="project-select-label">Proyecto</InputLabel>
                <Select
                  labelId="project-select-label"
                  id="projectId"
                  name="projectId"
                  value={formik.values.projectId}
                  onChange={formik.handleChange}
                  label="Proyecto"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.projectId && formik.errors.projectId && (
                  <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                    {formik.errors.projectId}
                  </div>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha"
                value={formik.values.date}
                onChange={(date) => formik.setFieldValue('date', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descripción"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="duration"
                name="duration"
                label="Duración (horas)"
                type="number"
                value={formik.values.duration}
                onChange={formik.handleChange}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
                variant="outlined"
                InputProps={{
                  inputProps: { min: 0, step: 0.25 },
                  endAdornment: <InputAdornment position="end">h</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.billable}
                    onChange={(e) => formik.setFieldValue('billable', e.target.checked)}
                    name="billable"
                    color="primary"
                  />
                }
                label="Facturable"
              />
            </Grid>
            
            {formik.values.billable && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="hourlyRate"
                  name="hourlyRate"
                  label="Tarifa por hora"
                  type="number"
                  value={formik.values.hourlyRate}
                  onChange={formik.handleChange}
                  error={formik.touched.hourlyRate && Boolean(formik.errors.hourlyRate)}
                  helperText={formik.touched.hourlyRate && formik.errors.hourlyRate}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TimeEntryForm;
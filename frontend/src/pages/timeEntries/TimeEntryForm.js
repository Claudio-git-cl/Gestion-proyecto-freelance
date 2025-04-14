import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { timeEntryService, projectService } from '../../services/api';

const TimeEntryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const isEditing = Boolean(id);
  
  // Get project ID from query params if available (for new entries)
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('project');

  const validationSchema = Yup.object({
    project: Yup.string().required('El proyecto es obligatorio'),
    date: Yup.date().required('La fecha es obligatoria'),
    hours: Yup.number()
      .positive('Las horas deben ser un número positivo')
      .required('Las horas son obligatorias'),
    description: Yup.string().required('La descripción es obligatoria')
  });

  const formik = useFormik({
    initialValues: {
      project: projectIdFromQuery || '',
      date: new Date(),
      hours: '',
      description: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        if (isEditing) {
          await timeEntryService.update(id, values);
        } else {
          await timeEntryService.create(values);
        }

        navigate('/time-entries');
      } catch (error) {
        console.error('Error al guardar registro de tiempo:', error);
        setError('Error al guardar el registro de tiempo. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        setError('Error al cargar los proyectos. Por favor, intenta de nuevo.');
      }
    };

    fetchProjects();

    if (isEditing) {
      const fetchTimeEntry = async () => {
        try {
          setInitialLoading(true);
          const timeEntry = await timeEntryService.getById(id);
          
          // Actualizar los valores del formulario
          Object.keys(formik.initialValues).forEach(key => {
            if (timeEntry[key] !== undefined) {
              if (key === 'date') {
                formik.setFieldValue(key, new Date(timeEntry[key]), false);
              } else {
                formik.setFieldValue(key, timeEntry[key], false);
              }
            }
          });
          
          setInitialLoading(false);
        } catch (error) {
          console.error('Error al cargar registro de tiempo:', error);
          setError('Error al cargar los datos del registro de tiempo.');
          setInitialLoading(false);
        }
      };

      fetchTimeEntry();
    }
  }, [id, isEditing]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Editar Registro de Tiempo' : 'Nuevo Registro de Tiempo'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="project-label">Proyecto</InputLabel>
                <Select
                  labelId="project-label"
                  id="project"
                  name="project"
                  value={formik.values.project}
                  onChange={formik.handleChange}
                  label="Proyecto"
                  error={formik.touched.project && Boolean(formik.errors.project)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha"
                value={formik.values.date}
                onChange={(value) => formik.setFieldValue('date', value)}
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
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="hours"
                name="hours"
                label="Horas"
                variant="outlined"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">h</InputAdornment>,
                  inputProps: { 
                    step: 0.25,
                    min: 0.25
                  }
                }}
                value={formik.values.hours}
                onChange={formik.handleChange}
                error={formik.touched.hours && Boolean(formik.errors.hours)}
                helperText={formik.touched.hours && formik.errors.hours}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descripción"
                variant="outlined"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/time-entries')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (isEditing ? 'Actualizar' : 'Guardar')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TimeEntryForm;
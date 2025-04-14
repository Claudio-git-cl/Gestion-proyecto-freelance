import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  AccessTime,
  AttachMoney,
  CalendarToday,
  Person,
  Chat
} from '@mui/icons-material';
import { getProjectById, updateProject, deleteProject } from '../redux/slices/projectSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const statusOptions = [
  { value: 'proposal', label: 'Propuesta', color: 'default' },
  { value: 'in_progress', label: 'En Progreso', color: 'primary' },
  { value: 'review', label: 'En Revisión', color: 'warning' },
  { value: 'completed', label: 'Completado', color: 'success' },
  { value: 'cancelled', label: 'Cancelado', color: 'error' }
];

const ProjectDetails = ({ projectId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { project, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    status: ''
  });
  
  // Obtener proyecto al cargar el componente
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
    }
  }, [dispatch, projectId]);
  
  // Actualizar formulario cuando se carga el proyecto
  useEffect(() => {
    if (project) {
      setEditForm({
        title: project.title || '',
        description: project.description || '',
        budget: project.budget || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        status: project.status || ''
      });
    }
  }, [project]);
  
  // Verificar si el usuario es cliente
  const isClient = user && user.role === 'client';
  
  // Verificar si el usuario es freelancer
  const isFreelancer = user && user.role === 'freelancer';
  
  // Verificar si el usuario es admin
  const isAdmin = user && user.role === 'admin';
  
  // Verificar si el usuario es el cliente del proyecto
  const isProjectClient = user && project && user.id === project.clientId;
  
  // Verificar si el usuario es el freelancer del proyecto
  const isProjectFreelancer = user && project && user.id === project.freelancerId;
  
  // Abrir diálogo de edición
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };
  
  // Cerrar diálogo de edición
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Guardar cambios
  const handleSaveChanges = () => {
    dispatch(updateProject({
      id: projectId,
      projectData: editForm
    }));
    setOpenEditDialog(false);
  };
  
  // Eliminar proyecto
  const handleDeleteProject = () => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(projectId));
      navigate('/projects');
    }
  };
  
  // Obtener color y etiqueta del estado
  const getStatusInfo = (status) => {
    const statusInfo = statusOptions.find(option => option.value === status);
    return statusInfo || { label: 'Desconocido', color: 'default' };
  };
  
  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'No establecida';
    return format(new Date(date), 'dd MMMM yyyy', { locale: es });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Typography color="error" sx={{ my: 2 }}>
        {error}
      </Typography>
    );
  }
  
  if (!project) {
    return (
      <Typography variant="body1" color="text.secondary">
        No se encontró el proyecto.
      </Typography>
    );
  }
  
  const statusInfo = getStatusInfo(project.status);
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.title}
          </Typography>
          
          <Box>
            <Chip
              label={statusInfo.label}
              color={statusInfo.color}
              sx={{ mr: 1 }}
            />
            
            {(isProjectClient || isAdmin) && (
              <>
                <Tooltip title="Editar proyecto">
                  <IconButton color="primary" onClick={handleOpenEditDialog}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Eliminar proyecto">
                  <IconButton color="error" onClick={handleDeleteProject}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {isProjectFreelancer && (
              <Tooltip title="Cambiar estado">
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleOpenEditDialog}
                >
                  Cambiar Estado
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {project.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles del Proyecto
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Presupuesto:</strong> ${project.budget}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Fecha límite:</strong> {formatDate(project.deadline)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Cliente:</strong> {project.client?.name || 'No asignado'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Freelancer:</strong> {project.freelancer?.name || 'No asignado'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo de edición */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isProjectFreelancer && !isAdmin ? 'Cambiar Estado del Proyecto' : 'Editar Proyecto'}
        </DialogTitle>
        
        <DialogContent>
          {(isProjectClient || isAdmin) && (
            <>
              <TextField
                margin="dense"
                label="Título"
                name="title"
                value={editForm.title}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Descripción"
                name="description"
                value={editForm.description}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Presupuesto"
                name="budget"
                type="number"
                value={editForm.budget}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Fecha límite"
                name="deadline"
                type="date"
                value={editForm.deadline}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </>
          )}
          
          <TextField
            margin="dense"
            label="Estado"
            name="status"
            select
            value={editForm.status}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveChanges} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  CalendarToday,
  AttachMoney,
  Person
} from '@mui/icons-material';
import { getProjects, createProject } from '../redux/slices/projectSlice';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusOptions = [
  { value: 'proposal', label: 'Propuesta', color: 'default' },
  { value: 'in_progress', label: 'En Progreso', color: 'primary' },
  { value: 'review', label: 'En Revisión', color: 'warning' },
  { value: 'completed', label: 'Completado', color: 'success' },
  { value: 'cancelled', label: 'Cancelado', color: 'error' }
];

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    freelancerId: ''
  });
  
  // Obtener proyectos al cargar el componente
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);
  
  // Verificar si el usuario es cliente
  const isClient = user && user.role === 'client';
  
  // Filtrar proyectos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Abrir diálogo para nuevo proyecto
  const handleOpenNewProjectDialog = () => {
    setOpenNewProjectDialog(true);
  };
  
  // Cerrar diálogo
  const handleCloseNewProjectDialog = () => {
    setOpenNewProjectDialog(false);
  };
  
  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Crear nuevo proyecto
  const handleCreateProject = () => {
    dispatch(createProject(newProjectForm));
    setOpenNewProjectDialog(false);
    setNewProjectForm({
      title: '',
      description: '',
      budget: '',
      deadline: '',
      freelancerId: ''
    });
  };
  
  // Obtener color y etiqueta del estado
  const getStatusInfo = (status) => {
    const statusInfo = statusOptions.find(option => option.value === status);
    return statusInfo || { label: 'Desconocido', color: 'default' };
  };
  
  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'No establecida';
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mis Proyectos
        </Typography>
        
        {isClient && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenNewProjectDialog}
          >
            Nuevo Proyecto
          </Button>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2 }}
        />
        
        <TextField
          select
          variant="outlined"
          label="Filtrar por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map(project => {
            const statusInfo = getStatusInfo(project.status);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {project.title}
                      </Typography>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {project.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        ${project.budget}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDate(project.deadline)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {isClient 
                          ? `Freelancer: ${project.freelancer?.name || 'No asignado'}`
                          : `Cliente: ${project.client?.name || 'No asignado'}`
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/projects/${project.id}`} 
                      size="small" 
                      color="primary"
                      fullWidth
                    >
                      Ver Detalles
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron proyectos. {isClient && '¡Crea tu primer proyecto!'}
        </Typography>
      )}
      
      {/* Diálogo para nuevo proyecto */}
      <Dialog open={openNewProjectDialog} onClose={handleCloseNewProjectDialog} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        
        <DialogContent>
          <TextField
            margin="dense"
            label="Título del Proyecto"
            name="title"
            value={newProjectForm.title}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Descripción"
            name="description"
            value={newProjectForm.description}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Presupuesto ($)"
            name="budget"
            type="number"
            value={newProjectForm.budget}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Fecha límite"
            name="deadline"
            type="date"
            value={newProjectForm.deadline}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="ID del Freelancer (opcional)"
            name="freelancerId"
            value={newProjectForm.freelancerId}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            helperText="Deja en blanco para asignar más tarde"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseNewProjectDialog}>Cancelar</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProjectForm.title || !newProjectForm.description || !newProjectForm.budget}
          >
            Crear Proyecto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Sort,
  Assignment,
  AttachMoney,
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  ArrowForward
} from '@mui/icons-material';
import { getProjects, createProject } from '../redux/slices/projectSlice';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    clientId: user?.role === 'client' ? user?.id : ''
  });
  
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleOpenNewProjectDialog = () => {
    setOpenNewProjectDialog(true);
  };
  
  const handleCloseNewProjectDialog = () => {
    setOpenNewProjectDialog(false);
    setNewProject({
      title: '',
      description: '',
      budget: '',
      deadline: '',
      clientId: user?.role === 'client' ? user?.id : ''
    });
  };
  
  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateProject = () => {
    dispatch(createProject(newProject));
    handleCloseNewProjectDialog();
  };
  
  // Filtrar y ordenar proyectos
  const filteredProjects = projects
    .filter(project => {
      // Filtrar por término de búsqueda
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por estado
      const matchesStatus = statusFilter ? project.status === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Ordenar por campo seleccionado
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'budget') {
        comparison = a.budget - b.budget;
      } else if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        comparison = new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else { // updatedAt por defecto
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      
      // Aplicar orden ascendente o descendente
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Obtener el estado del proyecto en español
  const getStatusLabel = (status) => {
    switch (status) {
      case 'proposal':
        return 'Propuesta';
      case 'in_progress':
        return 'En Progreso';
      case 'review':
        return 'En Revisión';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };
  
  // Obtener el color del chip según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'proposal':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No establecida';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };
  
  // Verificar si una fecha está próxima a vencer (menos de 7 días)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return isAfter(deadlineDate, today) && isBefore(deadlineDate, sevenDaysFromNow);
  };
  
  // Verificar si una fecha está vencida
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    return isBefore(deadlineDate, today);
  };
  
  // Verificar si el usuario es cliente
  const isClient = user && user.role === 'client';
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Proyectos
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
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Estado"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="proposal">Propuesta</MenuItem>
                <MenuItem value="in_progress">En Progreso</MenuItem>
                <MenuItem value="review">En Revisión</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Ordenar por</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={handleSortChange}
                label="Ordenar por"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                }
              >
                <MenuItem value="updatedAt">Última actualización</MenuItem>
                <MenuItem value="createdAt">Fecha de creación</MenuItem>
                <MenuItem value="title">Título</MenuItem>
                <MenuItem value="deadline">Fecha límite</MenuItem>
                <MenuItem value="budget">Presupuesto</MenuItem>
                <MenuItem value="status">Estado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={toggleSortOrder}
              startIcon={sortOrder === 'asc' ? <ArrowForward sx={{ transform: 'rotate(-90deg)' }} /> : <ArrowForward sx={{ transform: 'rotate(90deg)' }} />}
            >
              {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                className="project-card" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled' && (
                  <Chip
                    label="Vencido"
                    color="error"
                    size="small"
                    icon={<Error />}
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      zIndex: 1
                    }}
                  />
                )}
                
                {isDeadlineApproaching(project.deadline) && !isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled' && (
                  <Chip
                    label="Próximo a vencer"
                    color="warning"
                    size="small"
                    icon={<Warning />}
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {project.description}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {project.budget ? `$${project.budget}` : 'No definido'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography 
                          variant="body2" 
                          color={
                            isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled'
                              ? 'error.main'
                              : isDeadlineApproaching(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled'
                                ? 'warning.main'
                                : 'text.primary'
                          }
                        >
                          {formatDate(project.deadline)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {project.client && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Cliente: {project.client.name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {project.freelancer && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Freelancer: {project.freelancer.name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                
                <CardActions>
                  <Button
                    component={Link}
                    to={`/projects/${project.id}`}
                    size="small"
                    endIcon={<ArrowForward />}
                  >
                    Ver detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter
              ? 'Intenta cambiar los filtros de búsqueda'
              : isClient
                ? 'Crea tu primer proyecto haciendo clic en "Nuevo Proyecto"'
                : 'No hay proyectos disponibles en este momento'}
          </Typography>
          
          {isClient && !searchTerm && !statusFilter && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenNewProjectDialog}
              sx={{ mt: 2 }}
            >
              Nuevo Proyecto
            </Button>
          )}
        </Paper>
      )}
      
      {/* Diálogo para crear nuevo proyecto */}
      <Dialog open={openNewProjectDialog} onClose={handleCloseNewProjectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Título del Proyecto"
            type="text"
            fullWidth
            value={newProject.title}
            onChange={handleNewProjectChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newProject.description}
            onChange={handleNewProjectChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="budget"
            label="Presupuesto ($)"
            type="number"
            fullWidth
            value={newProject.budget}
            onChange={handleNewProjectChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="deadline"
            label="Fecha Límite"
            type="date"
            fullWidth
            value={newProject.deadline}
            onChange={handleNewProjectChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseNewProjectDialog}>Cancelar</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProject.title || !newProject.description}
          >
            Crear Proyecto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
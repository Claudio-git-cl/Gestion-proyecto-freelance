import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  fetchProjects,
  deleteProject,
  clearProjectError,
  clearProjectSuccess
} from '../redux/slices/projectSlice';
import { startTimer } from '../redux/slices/timeTrackingSlice';
import ProjectDialog from '../components/projects/ProjectDialog';
import ProjectFilterDialog from '../components/projects/ProjectFilterDialog';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading, error, success } = useSelector(state => state.projects);
  
  const [openForm, setOpenForm] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOption, setSortOption] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [successMessage, setSuccessMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  useEffect(() => {
    if (projects) {
      let filtered = [...projects];
      
      // Aplicar búsqueda
      if (searchTerm) {
        filtered = filtered.filter(project => 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.client && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortOption) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'client':
            valueA = (a.client?.name || '').toLowerCase();
            valueB = (b.client?.name || '').toLowerCase();
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          case 'deadline':
            valueA = a.deadline ? new Date(a.deadline) : new Date(0);
            valueB = b.deadline ? new Date(b.deadline) : new Date(0);
            break;
          case 'createdAt':
            valueA = new Date(a.createdAt);
            valueB = new Date(b.createdAt);
            break;
          case 'updatedAt':
          default:
            valueA = new Date(a.updatedAt);
            valueB = new Date(b.updatedAt);
            break;
        }
        
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
      
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm, sortOption, sortDirection]);
  
  useEffect(() => {
    if (success) {
      setSuccessMessage('Operación completada con éxito');
      setTimeout(() => {
        dispatch(clearProjectSuccess());
      }, 3000);
    }
  }, [success, dispatch]);
  
  const handleOpenForm = () => {
    setEditingProject(null);
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingProject(null);
  };
  
  const handleOpenFilter = () => {
    setOpenFilter(true);
  };
  
  const handleCloseFilter = () => {
    setOpenFilter(false);
  };
  
  const handleEditProject = (project) => {
    setEditingProject(project);
    setOpenForm(true);
  };
  
  const handleDeleteProject = (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      dispatch(deleteProject(projectId));
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSortChange = (option) => {
    if (sortOption === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('desc');
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };
  
  const handleOpenMenu = (event, projectId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedProjectId(null);
  };
  
  const handleStartTimer = () => {
    if (selectedProjectId) {
      dispatch(startTimer(selectedProjectId));
      handleCloseMenu();
    }
  };
  
  const handleViewProject = () => {
    if (selectedProjectId) {
      navigate(`/projects/${selectedProjectId}`);
      handleCloseMenu();
    }
  };
  
  const handleCreateInvoice = () => {
    if (selectedProjectId) {
      navigate(`/invoices/new?projectId=${selectedProjectId}`);
      handleCloseMenu();
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'paused':
        return 'En pausa';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };
  
  if (loading && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Nuevo Proyecto
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearProjectError())}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Buscar proyectos..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={handleOpenFilter}
        >
          Filtrar
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
        >
          Ordenar
        </Button>
        
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl) && !selectedProjectId}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleSortChange('name')}>
            Nombre {sortOption === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('client')}>
            Cliente {sortOption === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('status')}>
            Estado {sortOption === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('deadline')}>
            Fecha límite {sortOption === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('updatedAt')}>
            Última actualización {sortOption === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
        </Menu>
      </Box>
      
      {filteredProjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Intenta con otra búsqueda o' : 'Comienza'} creando un nuevo proyecto
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
            sx={{ mt: 2 }}
          >
            Nuevo Proyecto
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {project.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, project.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Cliente: {project.client?.name || 'Sin cliente'}
                  </Typography>
                  
                  {project.deadline && (
                    <Typography variant="body2" color="text.secondary">
                      Fecha límite: {format(new Date(project.deadline), 'dd MMM yyyy', { locale: es })}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.description || 'Sin descripción'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/projects/${project.id}`}
                  >
                    Ver detalles
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleEditProject(project)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl) && Boolean(selectedProjectId)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleViewProject}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          Ver detalles
        </MenuItem>
        <MenuItem onClick={handleStartTimer}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          Iniciar temporizador
        </MenuItem>
        <MenuItem onClick={handleCreateInvoice}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          Crear factura
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const project = projects.find(p => p.id === selectedProjectId);
          if (project) {
            handleEditProject(project);
            handleCloseMenu();
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteProject(selectedProjectId);
          handleCloseMenu();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Eliminar
        </MenuItem>
      </Menu>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
      
      <ProjectDialog
        open={openForm}
        onClose={handleCloseForm}
        project={editingProject}
      />
      
      <ProjectFilterDialog
        open={openFilter}
        onClose={handleCloseFilter}
        onApply={(filters) => {
          // Implement filter logic here
          console.log('Applied filters:', filters);
          // You would typically update a filter state and then filter the projects
        }}
        clients={[]} // Pass clients from state when available
      />
    </Box>
  );
};

export default ProjectsPage;
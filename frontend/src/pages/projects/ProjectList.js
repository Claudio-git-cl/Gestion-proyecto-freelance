import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { projectService } from '../../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    if (projects.length > 0) {
      filterProjects();
    }
  }, [searchTerm, statusFilter, projects]);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
      setFilteredProjects(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los proyectos: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const filterProjects = () => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.client && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
    setPage(0);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      setLoading(true);
      await projectService.delete(projectToDelete.id);
      
      // Update project list
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectToDelete.id));
      setSuccess(`Proyecto "${projectToDelete.name}" eliminado correctamente`);
      
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setLoading(false);
    } catch (err) {
      setError('Error al eliminar el proyecto: ' + (err.message || 'Inténtalo de nuevo'));
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso':
        return 'primary';
      case 'Completado':
        return 'success';
      case 'En pausa':
        return 'warning';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Proyectos
          </Typography>
          
          <Button
            component={RouterLink}
            to="/projects/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nuevo Proyecto
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar proyectos por nombre, descripción o cliente..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Estado"
                onChange={handleStatusFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="En progreso">En progreso</MenuItem>
                <MenuItem value="Completado">Completado</MenuItem>
                <MenuItem value="En pausa">En pausa</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
        
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fechas</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress sx={{ my: 3 }} />
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {searchTerm || statusFilter !== 'all' ? 'No se encontraron proyectos con esos filtros' : 'No hay proyectos registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{project.name}</Typography>
                          {project.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project.description.substring(0, 60)}
                              {project.description.length > 60 ? '...' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.client ? (
                            <RouterLink to={`/clients/${project.client.id}`} style={{ textDecoration: 'none' }}>
                              <Typography color="primary" variant="body2">
                                {project.client.name}
                              </Typography>
                            </RouterLink>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin cliente
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            Inicio: {new Date(project.startDate).toLocaleDateString()}
                          </Typography>
                          {project.endDate && (
                            <Typography variant="body2">
                              Fin: {new Date(project.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            color={getStatusColor(project.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={project.progress || 0} 
                                color={
                                  project.progress >= 100 ? 'success' :
                                  project.progress > 50 ? 'primary' :
                                  project.progress > 25 ? 'warning' : 'error'
                                }
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {`${project.progress || 0}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              component={RouterLink}
                              to={`/projects/${project.id}`}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              component={RouterLink}
                              to={`/projects/${project.id}/edit`}
                              size="small"
                              sx={{ mx: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(project)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el proyecto "{projectToDelete?.name}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectList;
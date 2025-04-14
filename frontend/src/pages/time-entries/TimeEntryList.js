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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { timeEntryService, projectService } from '../../services/api';

const TimeEntryList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (timeEntries.length > 0) {
      filterEntries();
    }
  }, [searchTerm, projectFilter, dateFilter, timeEntries]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        timeEntryService.getAll(),
        projectService.getAll()
      ]);
      setTimeEntries(entriesData);
      setFilteredEntries(entriesData);
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los registros de tiempo: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const filterEntries = () => {
    let filtered = [...timeEntries];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.project && entry.project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.task && entry.task.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(entry => entry.projectId === projectFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfToday;
          });
          break;
        case 'thisWeek':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfWeek;
          });
          break;
        case 'thisMonth':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfMonth;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredEntries(filtered);
    setPage(0);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleProjectFilterChange = (e) => {
    setProjectFilter(e.target.value);
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    
    try {
      setLoading(true);
      await timeEntryService.delete(entryToDelete.id);
      
      // Update entries list
      setTimeEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryToDelete.id));
      setSuccess(`Registro de tiempo eliminado correctamente`);
      
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      setLoading(false);
    } catch (err) {
      setError('Error al eliminar el registro de tiempo: ' + (err.message || 'Inténtalo de nuevo'));
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Registro de Tiempo
          </Typography>
          
          <Button
            component={RouterLink}
            to="/time-entries/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nuevo Registro
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flexGrow: 1 }}
              variant="outlined"
              placeholder="Buscar por descripción, proyecto o tarea..."
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
              <InputLabel id="project-filter-label">Proyecto</InputLabel>
              <Select
                labelId="project-filter-label"
                id="project-filter"
                value={projectFilter}
                label="Proyecto"
                onChange={handleProjectFilterChange}
              >
                <MenuItem value="all">Todos los proyectos</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="date-filter-label">Período</InputLabel>
              <Select
                labelId="date-filter-label"
                id="date-filter"
                value={dateFilter}
                label="Período"
                onChange={handleDateFilterChange}
              >
                <MenuItem value="all">Todo el tiempo</MenuItem>
                <MenuItem value="today">Hoy</MenuItem>
                <MenuItem value="thisWeek">Esta semana</MenuItem>
                <MenuItem value="thisMonth">Este mes</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
        
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Tarea</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress sx={{ my: 3 }} />
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {searchTerm || projectFilter !== 'all' || dateFilter !== 'all' ? 
                        'No se encontraron registros con esos filtros' : 
                        'No hay registros de tiempo'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {entry.project ? (
                            <RouterLink to={`/projects/${entry.project.id}`} style={{ textDecoration: 'none' }}>
                              <Typography color="primary" variant="body2">
                                {entry.project.name}
                              </Typography>
                            </RouterLink>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.task ? (
                            <RouterLink to={`/tasks/${entry.task.id}`} style={{ textDecoration: 'none' }}>
                              <Typography color="primary" variant="body2">
                                {entry.task.name}
                              </Typography>
                            </RouterLink>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(entry.duration)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton
                              component={RouterLink}
                              to={`/time-entries/${entry.id}/edit`}
                              size="small"
                              sx={{ mx: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(entry)}
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
            count={filteredEntries.length}
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
            ¿Estás seguro de que deseas eliminar este registro de tiempo? Esta acción no se puede deshacer.
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

export default TimeEntryList;
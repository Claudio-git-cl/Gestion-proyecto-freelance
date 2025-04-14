import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
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
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { timeEntryService, projectService } from '../../services/api';

const TimeEntriesList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [timerLoading, setTimerLoading] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        timeEntryService.getAll(),
        projectService.getAll()
      ]);
      setTimeEntries(entriesData);
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleProjectFilterChange = (event) => {
    setProjectFilter(event.target.value);
    setPage(0);
  };
  
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    
    try {
      setDeleteLoading(true);
      await timeEntryService.delete(entryToDelete.id);
      setTimeEntries(timeEntries.filter(entry => entry.id !== entryToDelete.id));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      setDeleteLoading(false);
    } catch (err) {
      setError('Error al eliminar el registro de tiempo');
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };
  
  const handleStartTimer = async (projectId) => {
    try {
      setTimerLoading(true);
      await timeEntryService.startTimer(projectId);
      fetchData(); // Refresh data
      setTimerLoading(false);
    } catch (err) {
      setError('Error al iniciar el temporizador');
      setTimerLoading(false);
    }
  };
  
  const handleStopTimer = async (projectId) => {
    try {
      setTimerLoading(true);
      await timeEntryService.stopTimer(projectId);
      fetchData(); // Refresh data
      setTimerLoading(false);
    } catch (err) {
      setError('Error al detener el temporizador');
      setTimerLoading(false);
    }
  };
  
  // Filtrar registros de tiempo por término de búsqueda y proyecto
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = 
      (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.projectName && entry.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.task && entry.task.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = projectFilter === '' || entry.projectId === projectFilter;
    
    return matchesSearch && matchesProject;
  });
  
  // Paginar registros de tiempo
  const paginatedEntries = filteredEntries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'En progreso';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Verificar si hay un temporizador activo
  const activeTimer = timeEntries.find(entry => entry.endTime === null);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Registro de Tiempo
        </Typography>
        <Button
          component={RouterLink}
          to="/time-entries/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nueva Entrada
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {activeTimer && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => handleStopTimer(activeTimer.projectId)}
              disabled={timerLoading}
              startIcon={timerLoading ? <CircularProgress size={20} /> : <PauseIcon />}
            >
              Detener
            </Button>
          }
        >
          Temporizador activo para: {activeTimer.projectName} - {activeTimer.description || 'Sin descripción'}
          <Typography variant="caption" display="block">
            Iniciado: {new Date(activeTimer.startTime).toLocaleString()}
          </Typography>
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="project-filter-label">Filtrar por proyecto</InputLabel>
            <Select
              labelId="project-filter-label"
              id="project-filter"
              value={projectFilter}
              onChange={handleProjectFilterChange}
              label="Filtrar por proyecto"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proyecto</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.projectName}</TableCell>
                    <TableCell>
                      {entry.description || 'Sin descripción'}
                      {entry.task && (
                        <Chip 
                          label={entry.task} 
                          size="small" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{new Date(entry.startTime).toLocaleDateString()}</TableCell>
                    <TableCell>{formatDuration(entry.durationMinutes)}</TableCell>
                    <TableCell>
                      {entry.endTime === null ? (
                        <Chip 
                          label="En progreso" 
                          color="primary" 
                          size="small"
                        />
                      ) : (
                        entry.billable ? (
                          <Chip 
                            label="Facturable" 
                            color="success" 
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            label="No facturable" 
                            size="small"
                            variant="outlined"
                          />
                        )
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {entry.endTime === null ? (
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleStopTimer(entry.projectId)}
                          disabled={timerLoading}
                          sx={{ mr: 1 }}
                        >
                          <PauseIcon />
                        </IconButton>
                      ) : (
                        !activeTimer && (
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleStartTimer(entry.projectId)}
                            disabled={timerLoading}
                            sx={{ mr: 1 }}
                          >
                            <PlayIcon />
                          </IconButton>
                        )
                      )}
                      <IconButton
                        component={RouterLink}
                        to={`/time-entries/${entry.id}/edit`}
                        color="secondary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(entry)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {searchTerm || projectFilter ? 'No se encontraron registros con esos filtros' : 'No hay registros de tiempo'}
                  </TableCell>
                </TableRow>
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
      
      {/* Diálogo de confirmación para eliminar */}
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
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TimeEntriesList;
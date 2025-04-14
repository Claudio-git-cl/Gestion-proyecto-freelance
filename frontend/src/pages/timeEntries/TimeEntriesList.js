import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { timeEntryService, projectService, clientService } from '../../services/api';

const TimeEntriesList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState({});
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    project: '',
    client: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
    fetchClients();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const data = await timeEntryService.getAll();
      setTimeEntries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar registros de tiempo:', error);
      setError('Error al cargar los registros de tiempo. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      const projectsMap = {};
      data.forEach(project => {
        projectsMap[project._id] = project;
      });
      setProjects(projectsMap);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      const clientsMap = {};
      data.forEach(client => {
        clientsMap[client._id] = client;
      });
      setClients(clientsMap);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await timeEntryService.delete(entryToDelete._id);
      setTimeEntries(timeEntries.filter(entry => entry._id !== entryToDelete._id));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Error al eliminar registro de tiempo:', error);
      setError('Error al eliminar el registro de tiempo. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterOpen = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleFilterApply = () => {
    setFilterDialogOpen(false);
    // Filters are applied in the filteredTimeEntries calculation
  };

  const handleFilterReset = () => {
    setFilters({
      project: '',
      client: '',
      startDate: null,
      endDate: null
    });
    setFilterDialogOpen(false);
  };

  const filteredTimeEntries = timeEntries.filter(entry => {
    // Apply search term filter
    const projectName = projects[entry.project]?.name || '';
    const description = entry.description || '';
    const searchMatch = 
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;
    
    // Apply project filter
    if (filters.project && entry.project !== filters.project) return false;
    
    // Apply client filter (through project)
    if (filters.client && projects[entry.project]?.client !== filters.client) return false;
    
    // Apply date filters
    const entryDate = new Date(entry.date);
    if (filters.startDate && entryDate < filters.startDate) return false;
    if (filters.endDate && entryDate > filters.endDate) return false;
    
    return true;
  });

  // Calculate total hours
  const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Registro de Tiempo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/time-entries/new"
        >
          Nuevo Registro
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por proyecto o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterOpen}
          >
            Filtrar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Typography variant="subtitle1">
            Total horas: <strong>{totalHours.toFixed(2)}</strong>
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Proyecto</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Horas</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTimeEntries.length > 0 ? (
                filteredTimeEntries.map((entry) => {
                  const project = projects[entry.project] || {};
                  const client = clients[project.client] || {};
                  
                  return (
                    <TableRow key={entry._id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{project.name || 'Proyecto desconocido'}</TableCell>
                      <TableCell>{client.name || 'Cliente desconocido'}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell align="right">{entry.hours.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            component={RouterLink}
                            to={`/time-entries/${entry._id}/edit`}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => handleDeleteClick(entry)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {searchTerm || Object.values(filters).some(v => v) 
                      ? 'No se encontraron registros que coincidan con los filtros' 
                      : 'No hay registros de tiempo'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de filtros */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleFilterClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filtrar registros de tiempo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="filter-client-label">Cliente</InputLabel>
                <Select
                  labelId="filter-client-label"
                  id="filter-client"
                  value={filters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                  label="Cliente"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.values(clients).map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="filter-project-label">Proyecto</InputLabel>
                <Select
                  labelId="filter-project-label"
                  id="filter-project"
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                  label="Proyecto"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.values(projects)
                    .filter(project => !filters.client || project.client === filters.client)
                    .map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha inicio"
                value={filters.startDate}
                onChange={(value) => handleFilterChange('startDate', value)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha fin"
                value={filters.endDate}
                onChange={(value) => handleFilterChange('endDate', value)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterReset}>Restablecer</Button>
          <Button onClick={handleFilterClose}>Cancelar</Button>
          <Button onClick={handleFilterApply} color="primary">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeEntriesList;
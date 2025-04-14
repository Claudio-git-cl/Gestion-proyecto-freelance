import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { fetchClients, deleteClient } from '../redux/slices/clientsSlice';

const ClientsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { clients, loading, error } = useSelector(state => state.clients);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('nameAsc');
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  // Cargar clientes al montar el componente
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);
  
  // Manejar apertura del menú de ordenación
  const handleSortMenuOpen = (event) => {
    setAnchorElSort(event.currentTarget);
  };
  
  // Manejar cierre del menú de ordenación
  const handleSortMenuClose = () => {
    setAnchorElSort(null);
  };
  
  // Manejar apertura del menú de filtros
  const handleFilterMenuOpen = (event) => {
    setAnchorElFilter(event.currentTarget);
  };
  
  // Manejar cierre del menú de filtros
  const handleFilterMenuClose = () => {
    setAnchorElFilter(null);
  };
  
  // Manejar cambio de ordenación
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    handleSortMenuClose();
  };
  
  // Manejar cambio de filtro
  const handleFilterChange = (filterOption) => {
    setFilterType(filterOption);
    handleFilterMenuClose();
  };
  
  // Manejar apertura del diálogo de eliminación
  const handleDeleteDialogOpen = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };
  
  // Manejar cierre del diálogo de eliminación
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };
  
  // Manejar eliminación de cliente
  const handleDeleteClient = () => {
    if (clientToDelete) {
      dispatch(deleteClient(clientToDelete.id));
      handleDeleteDialogClose();
    }
  };
  
  // Filtrar y ordenar clientes
  const getFilteredAndSortedClients = () => {
    if (!clients) return [];
    
    let filteredClients = [...clients];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filteredClients = filteredClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar filtro de tipo
    if (filterType !== 'all') {
      filteredClients = filteredClients.filter(client => 
        client.type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Aplicar ordenación
    switch (sortBy) {
      case 'nameAsc':
        filteredClients.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filteredClients.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'dateAsc':
        filteredClients.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'dateDesc':
        filteredClients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    
    return filteredClients;
  };
  
  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Obtener color de avatar según tipo de cliente
  const getAvatarColor = (type) => {
    switch (type.toLowerCase()) {
      case 'empresa':
      case 'company':
        return '#1976d2'; // Azul
      case 'individual':
      case 'person':
        return '#388e3c'; // Verde
      default:
        return '#757575'; // Gris
    }
  };
  
  // Obtener clientes filtrados y ordenados
  const filteredAndSortedClients = getFilteredAndSortedClients();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/clients/new"
          >
            Nuevo Cliente
          </Button>
        </Box>
        
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterMenuOpen}
                  size="small"
                >
                  Filtrar
                </Button>
                <Menu
                  anchorEl={anchorElFilter}
                  open={Boolean(anchorElFilter)}
                  onClose={handleFilterMenuClose}
                >
                  <MenuItem onClick={() => handleFilterChange('all')} selected={filterType === 'all'}>
                    Todos
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterChange('empresa')} selected={filterType === 'empresa'}>
                    Empresas
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterChange('individual')} selected={filterType === 'individual'}>
                    Individuales
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={handleSortMenuOpen}
                  size="small"
                >
                  Ordenar
                </Button>
                <Menu
                  anchorEl={anchorElSort}
                  open={Boolean(anchorElSort)}
                  onClose={handleSortMenuClose}
                >
                  <MenuItem onClick={() => handleSortChange('nameAsc')} selected={sortBy === 'nameAsc'}>
                    Nombre (A-Z)
                  </MenuItem>
                  <MenuItem onClick={() => handleSortChange('nameDesc')} selected={sortBy === 'nameDesc'}>
                    Nombre (Z-A)
                  </MenuItem>
                  <MenuItem onClick={() => handleSortChange('dateDesc')} selected={sortBy === 'dateDesc'}>
                    Fecha de creación (Reciente primero)
                  </MenuItem>
                  <MenuItem onClick={() => handleSortChange('dateAsc')} selected={sortBy === 'dateAsc'}>
                    Fecha de creación (Antiguo primero)
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      )}
      
      {!loading && filteredAndSortedClients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron clientes
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {searchTerm || filterType !== 'all' 
              ? 'Intenta cambiar los filtros de búsqueda' 
              : 'Comienza añadiendo tu primer cliente'}
          </Typography>
          {!searchTerm && filterType === 'all' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/clients/new"
              sx={{ mt: 2 }}
            >
              Añadir Cliente
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedClients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getAvatarColor(client.type),
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      {client.avatar ? (
                        <img src={client.avatar} alt={client.name} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        getInitials(client.name)
                      )}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" noWrap>
                        {client.name}
                      </Typography>
                      <Chip 
                        icon={client.type === 'empresa' ? <BusinessIcon /> : <PersonIcon />}
                        label={client.type === 'empresa' ? 'Empresa' : 'Individual'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDialogOpen(client);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {client.company && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {client.company}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" gutterBottom>
                    <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {client.email}
                  </Typography>
                  
                  {client.phone && (
                    <Typography variant="body2" gutterBottom>
                      <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {client.phone}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    component={Link}
                    to={`/clients/${client.id}`}
                  >
                    Ver
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/clients/${client.id}/edit`}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Eliminar Cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el cliente "{clientToDelete?.name}"? Esta acción no se puede deshacer y eliminará todos los proyectos y facturas asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteClient} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as ProjectIcon,
  Receipt as InvoiceIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { clientService, projectService, invoiceService } from '../../services/api';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    fetchClientData();
  }, [id]);
  
  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientData = await clientService.getById(id);
      setClient(clientData);
      
      // Fetch client projects
      const projectsData = await projectService.getByClientId(id);
      setProjects(projectsData);
      
      // Fetch client invoices
      const invoicesData = await invoiceService.getByClientId(id);
      setInvoices(invoicesData);
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del cliente');
      setLoading(false);
    }
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await clientService.delete(id);
      setDeleteDialogOpen(false);
      navigate('/clients');
    } catch (err) {
      setError('Error al eliminar el cliente');
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!client) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Cliente no encontrado
        </Alert>
        <Button
          component={RouterLink}
          to="/clients"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista de clientes
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              component={RouterLink}
              to="/clients"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {client.name}
            </Typography>
            {client.company && (
              <Chip
                icon={<BusinessIcon />}
                label={client.company}
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Box>
            <Button
              component={RouterLink}
              to={`/clients/${id}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Correo Electrónico"
                  secondary={client.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Teléfono"
                  secondary={client.phone || 'No especificado'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dirección"
                  secondary={client.address || 'No especificada'}
                />
              </ListItem>
              {client.notes && (
                <ListItem>
                  <ListItemIcon>
                    <NotesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notas"
                    secondary={client.notes}
                  />
                </ListItem>
              )}
            </List>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="client tabs">
                <Tab label="Proyectos" id="client-tab-0" aria-controls="client-tabpanel-0" />
                <Tab label="Facturas" id="client-tab-1" aria-controls="client-tabpanel-1" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Proyectos ({projects.length})
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/projects/new?clientId=${id}`}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Nuevo Proyecto
                </Button>
              </Box>
              
              {projects.length > 0 ? (
                <Grid container spacing={2}>
                  {projects.map(project => (
                    <Grid item xs={12} sm={6} key={project.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {project.description?.substring(0, 100)}
                            {project.description?.length > 100 ? '...' : ''}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={project.status} 
                              size="small" 
                              color={
                                project.status === 'Completado' ? 'success' :
                                project.status === 'En progreso' ? 'primary' :
                                project.status === 'Pausado' ? 'warning' : 'default'
                              }
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={`$${project.rate}/hora`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={RouterLink} 
                            to={`/projects/${project.id}`}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay proyectos asociados a este cliente
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Facturas ({invoices.length})
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/invoices/new?clientId=${id}`}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Nueva Factura
                </Button>
              </Box>
              
              {invoices.length > 0 ? (
                <Grid container spacing={2}>
                  {invoices.map(invoice => (
                    <Grid item xs={12} key={invoice.id}>
                      <Card>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="h6" component="div">
                                Factura #{invoice.number}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Fecha: {new Date(invoice.date).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Vencimiento: {new Date(invoice.dueDate).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                              <Typography variant="h6" component="div">
                                ${invoice.total.toFixed(2)}
                              </Typography>
                              <Chip 
                                label={invoice.status} 
                                size="small" 
                                color={
                                  invoice.status === 'Pagada' ? 'success' :
                                  invoice.status === 'Pendiente' ? 'warning' :
                                  invoice.status === 'Vencida' ? 'error' : 'default'
                                }
                                sx={{ mt: 1 }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={RouterLink} 
                            to={`/invoices/${invoice.id}`}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay facturas asociadas a este cliente
                </Typography>
              )}
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al cliente "{client.name}"? Esta acción no se puede deshacer.
            {projects.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 2, color: 'error.main' }}>
                ¡Advertencia! Este cliente tiene {projects.length} proyecto(s) asociado(s) que también se eliminarán.
              </Box>
            )}
            {invoices.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                ¡Advertencia! Este cliente tiene {invoices.length} factura(s) asociada(s) que también se eliminarán.
              </Box>
            )}
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

export default ClientDetails;
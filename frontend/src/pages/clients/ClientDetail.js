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
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getById, deleteClient } from '../../services/api/clientService';
import { getAll as getAllInvoices } from '../../services/api/invoiceService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchClientAndInvoices();
  }, [id]);
  
  const fetchClientAndInvoices = async () => {
    try {
      setLoading(true);
      const [clientData, invoicesData] = await Promise.all([
        getById(id),
        getAllInvoices({ clientId: id })
      ]);
      
      setClient(clientData);
      setInvoices(invoicesData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleDeleteClick = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente "${client.name}"?`)) {
      try {
        await deleteClient(id);
        navigate('/clients');
        alert('Cliente eliminado correctamente');
      } catch (err) {
        setError('Error al eliminar el cliente: ' + (err.message || 'Inténtalo de nuevo'));
      }
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pagada':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Vencida':
        return 'error';
      case 'Anulada':
        return 'default';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!client) {
    return (
      <Container>
        <Alert severity="error">
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
  
  // Calcular estadísticas del cliente
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pendiente');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={RouterLink}
            to="/clients"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {client.name}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Información del Cliente
                </Typography>
                <Box>
                  <IconButton
                    component={RouterLink}
                    to={`/clients/${id}/edit`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={handleDeleteClick}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                {client.email && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <EmailIcon color="action" sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Email"
                      secondary={client.email}
                    />
                  </ListItem>
                )}
                
                {client.phone && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <PhoneIcon color="action" sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Teléfono"
                      secondary={client.phone}
                    />
                  </ListItem>
                )}
                
                {client.address && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <LocationOnIcon color="action" sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Dirección"
                      secondary={client.address}
                    />
                  </ListItem>
                )}
              </List>
              
              {client.notes && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Notas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client.notes}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Resumen Financiero
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Facturado
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {formatCurrency(totalInvoiced)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pendiente de Cobro
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {formatCurrency(totalPending)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Facturas Totales
                  </Typography>
                  <Typography variant="h5">
                    {invoices.length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Facturas Pendientes
                  </Typography>
                  <Typography variant="h5">
                    {pendingInvoices.length}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to={`/invoices/new?clientId=${id}`}
                  variant="contained"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  fullWidth
                >
                  Crear Nueva Factura
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Facturas
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {invoices.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <RouterLink to={`/invoices/${invoice.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              #{invoice.number}
                            </RouterLink>
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={invoice.status}
                              color={getStatusColor(invoice.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              component={RouterLink}
                              to={`/invoices/${invoice.id}`}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 3 }}>
                  Este cliente no tiene facturas registradas
                </Typography>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to={`/invoices?clientId=${id}`}
                  color="primary"
                >
                  Ver todas las facturas
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ClientDetail;
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { getAll as getAllInvoices } from '../services/api/invoiceService';
import { getAll as getAllClients } from '../services/api/clientService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    invoiceCount: 0,
    clientCount: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, clientsData] = await Promise.all([
        getAllInvoices(),
        getAllClients()
      ]);
      
      setInvoices(invoicesData);
      setClients(clientsData);
      
      // Calculate statistics
      calculateStats(invoicesData, clientsData);
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };

  const calculateStats = (invoicesData, clientsData) => {
    const totalInvoiced = invoicesData.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalPaid = invoicesData
      .filter(invoice => invoice.status === 'Pagada')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const totalPending = invoicesData
      .filter(invoice => invoice.status === 'Pendiente')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const pendingInvoices = invoicesData.filter(invoice => invoice.status === 'Pendiente').length;
    const paidInvoices = invoicesData.filter(invoice => invoice.status === 'Pagada').length;
    
    setStats({
      totalInvoiced,
      totalPaid,
      totalPending,
      invoiceCount: invoicesData.length,
      clientCount: clientsData.length,
      pendingInvoices,
      paidInvoices
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                Total Facturado
              </Typography>
              <MoneyIcon />
            </Box>
            <Typography component="p" variant="h4">
              {formatCurrency(stats.totalInvoiced)}
            </Typography>
            <Typography color="inherit" sx={{ flex: 1 }}>
              {stats.invoiceCount} facturas
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                Total Cobrado
              </Typography>
              <ReceiptIcon />
            </Box>
            <Typography component="p" variant="h4">
              {formatCurrency(stats.totalPaid)}
            </Typography>
            <Typography color="inherit" sx={{ flex: 1 }}>
              {stats.paidInvoices} facturas pagadas
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                Pendiente de Cobro
              </Typography>
              <AssignmentIcon />
            </Box>
            <Typography component="p" variant="h4">
              {formatCurrency(stats.totalPending)}
            </Typography>
            <Typography color="inherit" sx={{ flex: 1 }}>
              {stats.pendingInvoices} facturas pendientes
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                Clientes
              </Typography>
              <PeopleIcon />
            </Box>
            <Typography component="p" variant="h4">
              {stats.clientCount}
            </Typography>
            <Typography color="inherit" sx={{ flex: 1 }}>
              Total de clientes
            </Typography>
          </Paper>
        </Grid>
        
        {/* Facturas recientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Facturas Recientes
              </Typography>
              <Button
                component={RouterLink}
                to="/invoices"
                color="primary"
                endIcon={<ArrowForwardIcon />}
              >
                Ver todas
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <RouterLink to={`/invoices/${invoice.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          #{invoice.number}
                        </RouterLink>
                      </TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={invoice.status}
                          color={getStatusColor(invoice.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay facturas registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Clientes recientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Clientes Recientes
              </Typography>
              <Button
                component={RouterLink}
                to="/clients"
                color="primary"
                endIcon={<ArrowForwardIcon />}
              >
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {clients.slice(0, 5).map((client) => (
              <Box key={client.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" component={RouterLink} to={`/clients/${client.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  {client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {client.email} • {client.phone || 'Sin teléfono'}
                </Typography>
              </Box>
            ))}
            {clients.length === 0 && (
              <Typography variant="body1" align="center">
                No hay clientes registrados
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Acciones rápidas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/invoices/new"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  sx={{ py: 2 }}
                >
                  Nueva Factura
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/clients/new"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ py: 2 }}
                >
                  Nuevo Cliente
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/api';

const InvoiceSummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      
      // Ordenar por fecha de vencimiento (las más próximas primero)
      const sortedInvoices = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      // Tomar solo las 5 más recientes
      setInvoices(sortedInvoices.slice(0, 5));
      
      // Calcular estadísticas
      const total = data.reduce((sum, invoice) => sum + invoice.total, 0);
      const paid = data
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0);
      const pending = data
        .filter(invoice => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + invoice.total, 0);
      const overdue = data
        .filter(invoice => invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.total, 0);
      
      setStats({ total, paid, pending, overdue });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Error al cargar las facturas');
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencida';
      case 'cancelled':
        return 'Anulada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={40} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Facturas" 
        action={
          <Button
            component={RouterLink}
            to="/invoices"
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            Ver todas
          </Button>
        }
      />
      <Divider />
      
      <CardContent sx={{ p: 0 }}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Facturado
              </Typography>
              <Typography variant="h5">
                {formatCurrency(stats.total)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pagado
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(stats.paid)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pendiente
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(stats.pending)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Vencido
              </Typography>
              <Typography variant="h5" color="error.main">
                {formatCurrency(stats.overdue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider />
        
        <List sx={{ p: 0 }}>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <React.Fragment key={invoice.id}>
                <ListItem 
                  button 
                  component={RouterLink} 
                  to={`/invoices/${invoice.id}`}
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={`#${invoice.number} - ${invoice.client?.name || 'Cliente'}`}
                    secondary={`Vence: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </Typography>
                      <Chip 
                        label={getStatusText(invoice.status)} 
                        color={getStatusColor(invoice.status)} 
                        size="small" 
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No hay facturas recientes"
                secondary="Crea tu primera factura para verla aquí"
              />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummary;
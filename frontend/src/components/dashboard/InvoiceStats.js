import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  AccessTime
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvoiceStats = ({ invoices }) => {
  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Facturación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay datos de facturación disponibles.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.status === 'Pagada')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'Pendiente')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  
  // Ordenar facturas pendientes por fecha de vencimiento
  const pendingInvoices = [...invoices]
    .filter(invoice => invoice.status === 'Pendiente')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  // Obtener las 5 facturas pendientes más próximas a vencer
  const upcomingInvoices = pendingInvoices.slice(0, 5);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Facturación
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Total Facturado
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              ${totalAmount.toFixed(2)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Pagado
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ mb: 1, color: 'success.main' }}>
              ${paidAmount.toFixed(2)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDown color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Pendiente
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ mb: 1, color: 'warning.main' }}>
              ${pendingAmount.toFixed(2)}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Porcentaje cobrado
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={paidPercentage} 
                  color="success"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(paidPercentage)}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {upcomingInvoices.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Próximos vencimientos
            </Typography>
            
            <List dense>
              {upcomingInvoices.map(invoice => (
                <ListItem key={invoice.id}>
                  <ListItemText
                    primary={`Factura #${invoice.number} - ${invoice.client.name}`}
                    secondary={`Vence: ${format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: es })}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      size="small"
                      label={`$${invoice.amount.toFixed(2)}`}
                      color="warning"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceStats;
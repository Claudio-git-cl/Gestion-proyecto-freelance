import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Box, 
  Button, 
  Chip,
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  Receipt as InvoiceIcon, 
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const RecentInvoices = ({ invoices = [], loading = false }) => {
  const theme = useTheme();

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Función para renderizar el estado de la factura con un chip de color
  const renderStatus = (status) => {
    let color = 'default';
    
    switch (status.toLowerCase()) {
      case 'pagada':
      case 'paid':
        color = 'success';
        break;
      case 'pendiente':
      case 'pending':
        color = 'warning';
        break;
      case 'vencida':
      case 'overdue':
        color = 'error';
        break;
      case 'borrador':
      case 'draft':
        color = 'default';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Facturas Recientes
        </Typography>
        <Button 
          component={Link} 
          to="/invoices/new" 
          startIcon={<AddIcon />} 
          size="small"
        >
          Nueva
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        // Esqueleto de carga
        Array.from(new Array(3)).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            {index < 2 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))
      ) : invoices.length > 0 ? (
        <List sx={{ flexGrow: 1, p: 0 }}>
          {invoices.map((invoice, index) => (
            <React.Fragment key={invoice.id}>
              <ListItem 
                component={Link} 
                to={`/invoices/${invoice.id}`}
                sx={{ 
                  p: 1, 
                  borderRadius: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemIcon>
                  <InvoiceIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {invoice.number}
                      </Typography>
                      {renderStatus(invoice.status)}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {invoice.client} • {formatCurrency(invoice.amount)}
                    </Typography>
                  }
                />
              </ListItem>
              {index < invoices.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No tienes facturas recientes
          </Typography>
          <Button 
            component={Link} 
            to="/invoices/new" 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2, alignSelf: 'center' }}
          >
            Crear nueva factura
          </Button>
        </Box>
      )}
      
      {invoices.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button 
            component={Link} 
            to="/invoices" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            Ver todas las facturas
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RecentInvoices;
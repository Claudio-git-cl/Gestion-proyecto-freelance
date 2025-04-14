import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  fetchInvoiceById,
  deleteInvoice,
  updateInvoiceStatus
} from '../redux/slices/invoiceSlice';

const InvoiceDetailsPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { invoice, loading, error } = useSelector(state => state.invoices);
  const { clients } = useSelector(state => state.clients);
  const { projects } = useSelector(state => state.projects);
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceById(invoiceId));
    }
  }, [dispatch, invoiceId]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    navigate(`/invoices/edit/${invoiceId}`);
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleDelete = () => {
    dispatch(deleteInvoice(invoiceId)).then(() => {
      navigate('/invoices');
    });
    setOpenDeleteDialog(false);
  };
  
  const handleMarkAsPaid = () => {
    dispatch(updateInvoiceStatus({ invoiceId, status: 'paid' }));
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencida';
      case 'draft':
        return 'Borrador';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };
  
  if (loading && !invoice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }
  
  if (!invoice) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="warning">No se encontró la factura</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }
  
  const client = clients.find(c => c.id === invoice.clientId);
  const project = projects.find(p => p.id === invoice.projectId);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Factura {invoice.number || `#${invoice.id.substring(0, 8)}`}
          </Typography>
        </Box>
        <Box>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={handleMarkAsPaid}
              sx={{ mr: 1 }}
            >
              Marcar como Pagada
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
            sx={{ mr: 1 }}
          >
            Eliminar
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            sx={{ mr: 1 }}
          >
            Enviar
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Descargar PDF
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado
                </Typography>
                <Chip
                  label={getStatusLabel(invoice.status)}
                  color={getStatusColor(invoice.status)}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Número de Factura
                </Typography>
                <Typography variant="body1">
                  {invoice.number || `#${invoice.id.substring(0, 8)}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Emisión
                </Typography>
                <Typography variant="body1">
                  {invoice.date ? format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es }) : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Vencimiento
                </Typography>
                <Typography variant="body1">
                  {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                </Typography>
              </Grid>
              {project && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Proyecto
                  </Typography>
                  <Typography variant="body1">
                    {project.name}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conceptos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="50%">Descripción</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">€{item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">€{(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay conceptos en esta factura
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">€{invoice.subtotal.toFixed(2)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">IVA ({invoice.taxRate}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">€{invoice.taxAmount.toFixed(2)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" align="right">
                    €{invoice.total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {invoice.notes && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {invoice.notes}
              </Typography>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          {client && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cliente
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" fontWeight="bold">{client.name}</Typography>
                {client.contactName && (
                  <Typography variant="body2">{client.contactName}</Typography>
                )}
                {client.address && (
                  <Typography variant="body2">{client.address}</Typography>
                )}
                {client.city && client.postalCode && (
                  <Typography variant="body2">{client.postalCode}, {client.city}</Typography>
                )}
                {client.country && (
                  <Typography variant="body2">{client.country}</Typography>
                )}
                {client.taxId && (
                  <Typography variant="body2" sx={{ mt: 1 }}>NIF/CIF: {client.taxId}</Typography>
                )}
                {client.email && (
                  <Typography variant="body2">Email: {client.email}</Typography>
                )}
                {client.phone && (
                  <Typography variant="body2">Teléfono: {client.phone}</Typography>
                )}
              </Box>
            </Paper>
          )}
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Datos de Pago
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Por favor, realice el pago a la siguiente cuenta bancaria:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Banco:</strong> Banco Ejemplo
              </Typography>
              <Typography variant="body2">
                <strong>IBAN:</strong> ES12 3456 7890 1234 5678 9012
              </Typography>
              <Typography variant="body2">
                <strong>BIC/SWIFT:</strong> EXAMPLEXXX
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Referencia:</strong> {invoice.number || `#${invoice.id.substring(0, 8)}`}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Eliminar Factura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceDetailsPage;
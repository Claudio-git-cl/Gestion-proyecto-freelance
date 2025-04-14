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
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { 
  getById, 
  deleteInvoice, 
  exportToPdf, 
  sendByEmail, 
  markAsPaid, 
  sendReminder 
} from '../../services/api/invoiceService';
import { getById as getClientById } from '../../services/api/clientService';

// Importar el servicio de PDF
import { downloadInvoicePdf } from '../../services/pdfService';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchInvoice();
  }, [id]);
  
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await getById(id);
      setInvoice(data);
      
      if (data.clientId) {
        const clientData = await getClientById(data.clientId);
        setClient(clientData);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos de la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleDeleteClick = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la factura #${invoice.number}?`)) {
      handleDelete();
    }
  };
  
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteInvoice(id);
      navigate('/invoices');
    } catch (err) {
      setError('Error al eliminar la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  // Reemplazar la función handleExportPdf
  const handleExportPdf = () => {
    try {
      downloadInvoicePdf(invoice, client);
    } catch (err) {
      setError('Error al exportar la factura a PDF: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const handleSendEmail = async () => {
    try {
      await sendByEmail(id);
      alert('La factura se ha enviado por correo electrónico correctamente');
    } catch (err) {
      setError('Error al enviar la factura por correo electrónico: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const handleMarkAsPaid = async () => {
    try {
      setLoading(true);
      await markAsPaid(id);
      // Actualizar la factura después de marcarla como pagada
      fetchInvoice();
    } catch (err) {
      setError('Error al marcar la factura como pagada: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleSendReminder = async () => {
    try {
      await sendReminder(id);
      alert('Se ha enviado un recordatorio al cliente');
    } catch (err) {
      setError('Error al enviar el recordatorio: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
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
  
  if (loading && !invoice) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!invoice) {
    return (
      <Container>
        <Alert severity="error">No se encontró la factura</Alert>
        <Button
          component={RouterLink}
          to="/invoices"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={RouterLink}
            to="/invoices"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Factura #{invoice.number}
          </Typography>
          <Chip 
            label={invoice.status} 
            color={getStatusColor(invoice.status)} 
            sx={{ ml: 2 }}
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={handleExportPdf}
            sx={{ mr: 1 }}
          >
            Exportar PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
            sx={{ mr: 1 }}
          >
            Enviar por Email
          </Button>
          <Button
            component={RouterLink}
            to={`/invoices/${id}/edit`}
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            disabled={invoice.status === 'Pagada' || invoice.status === 'Anulada'}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            disabled={invoice.status === 'Pagada'}
          >
            Eliminar
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Información de la Factura
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Número:</strong> {invoice.number}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Fecha de Emisión:</strong> {new Date(invoice.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Fecha de Vencimiento:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Estado:</strong> {invoice.status}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cliente
                  </Typography>
                  {client ? (
                    <>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Nombre:</strong> {client.name}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {client.email}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Teléfono:</strong> {client.phone || 'N/A'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Dirección:</strong> {client.address || 'N/A'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">
                      Información del cliente no disponible
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              {invoice.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notas
                  </Typography>
                  <Typography variant="body1">
                    {invoice.notes}
                  </Typography>
                </Box>
              )}
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ítems de la Factura
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Importe</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay ítems en esta factura
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">IVA ({invoice.taxRate}%):</Typography>
                <Typography variant="body1">{formatCurrency(invoice.taxAmount)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
              </Box>
            </Paper>
            
            {invoice.status === 'Pendiente' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Acciones
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  onClick={handleMarkAsPaid}
                  sx={{ mb: 2 }}
                >
                  Marcar como Pagada
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EmailIcon />}
                  onClick={handleSendReminder}
                >
                  Enviar Recordatorio
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default InvoiceDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  AttachMoney as PaymentIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/api';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    paymentReference: ''
  });
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    fetchInvoice();
  }, [id]);
  
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getById(id);
      setInvoice(data);
      
      // Pre-fill email data
      if (data.client && data.client.email) {
        setEmailData(prev => ({
          ...prev,
          to: data.client.email,
          subject: `Factura #${data.number} - ${data.client.name}`,
          message: `
            <p>Estimado/a cliente,</p>
            <p>Adjunto encontrará la factura #${data.number} correspondiente al proyecto "${data.project?.name || 'N/A'}".</p>
            <p>Fecha de emisión: ${new Date(data.date).toLocaleDateString()}</p>
            <p>Fecha de vencimiento: ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>Total a pagar: ${formatCurrency(data.total)}</p>
            <p>Por favor, no dude en contactarnos si tiene alguna pregunta.</p>
            <p>Saludos cordiales,</p>
          `
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar factura:', error);
      setError('Error al cargar los datos de la factura. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };
  
  const handlePaymentDialogOpen = () => {
    setPaymentDialogOpen(true);
  };
  
  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
  };
  
  const handleEmailDialogOpen = () => {
    setEmailDialogOpen(true);
  };
  
  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMarkAsPaid = async () => {
    try {
      setPaymentLoading(true);
      setProcessing(true);
      await invoiceService.markAsPaid(id, paymentData);
      setPaymentDialogOpen(false);
      fetchInvoice();
      setSuccess('Factura marcada como pagada correctamente');
      setPaymentLoading(false);
      setProcessing(false);
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      setError('Error al marcar la factura como pagada. Por favor, intenta de nuevo.');
      setPaymentLoading(false);
      setProcessing(false);
    }
  };
  
  const handleSendEmail = async () => {
    try {
      setEmailLoading(true);
      setProcessing(true);
      await invoiceService.sendByEmail(id, emailData);
      setEmailDialogOpen(false);
      setSuccess('Factura enviada por correo electrónico correctamente');
      setEmailLoading(false);
      setProcessing(false);
    } catch (error) {
      console.error('Error al enviar email:', error);
      setError('Error al enviar la factura por correo electrónico. Por favor, intenta de nuevo.');
      setEmailLoading(false);
      setProcessing(false);
    }
  };
  
  const handleDeleteInvoice = async () => {
    try {
      setDeleteLoading(true);
      setProcessing(true);
      await invoiceService.delete(id);
      setDeleteDialogOpen(false);
      setDeleteLoading(false);
      setProcessing(false);
      navigate('/invoices');
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      setError('Error al eliminar la factura. Por favor, intenta de nuevo.');
      setDeleteLoading(false);
      setProcessing(false);
    }
  };
  
  const handleGeneratePdf = async () => {
    try {
      const pdfBlob = await invoiceService.generatePdf(id);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a link and click it to download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };
  
  const formatCurrency = (amount, currency = invoice?.currency || 'USD') => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
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
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      case 'draft':
        return 'info';
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
  
  if (!invoice) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          No se pudo cargar la factura
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Factura #{invoice.number}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/invoices')}
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          <IconButton
            color="primary"
            onClick={handleGeneratePdf}
            title="Descargar PDF"
            sx={{ mr: 1 }}
          >
            <PdfIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleEmailDialogOpen}
            title="Enviar por Email"
            sx={{ mr: 1 }}
            disabled={invoice.status === 'draft'}
          >
            <EmailIcon />
          </IconButton>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <IconButton
              color="primary"
              onClick={handlePaymentDialogOpen}
              title="Marcar como Pagada"
              sx={{ mr: 1 }}
            >
              <PaymentIcon />
            </IconButton>
          )}
          <IconButton
            color="primary"
            component={RouterLink}
            to={`/invoices/${id}/edit`}
            title="Editar"
            sx={{ mr: 1 }}
            disabled={invoice.status === 'paid'}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={handleDeleteDialogOpen}
            title="Eliminar"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Información de Factura
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Chip 
                label={getStatusText(invoice.status)} 
                color={getStatusColor(invoice.status)} 
                size="small" 
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de Emisión
              </Typography>
              <Typography variant="body1">
                {new Date(invoice.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de Vencimiento
              </Typography>
              <Typography variant="body1">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
            {invoice.status === 'paid' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Pago
                  </Typography>
                  <Typography variant="body1">
                    {new Date(invoice.paymentDate).toLocaleDateString()}
                  </Typography>
                </Box>
                {invoice.paymentMethod && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Método de Pago
                    </Typography>
                    <Typography variant="body1">
                      {invoice.paymentMethod === 'bank_transfer' ? 'Transferencia bancaria' :
                       invoice.paymentMethod === 'credit_card' ? 'Tarjeta de crédito' :
                       invoice.paymentMethod === 'cash' ? 'Efectivo' :
                       invoice.paymentMethod === 'paypal' ? 'PayPal' : 'Otro'}
                    </Typography>
                  </Box>
                )}
                {invoice.paymentReference && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Referencia de Pago
                    </Typography>
                    <Typography variant="body1">
                      {invoice.paymentReference}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Cliente
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nombre
              </Typography>
              <Typography variant="body1">
                {invoice.client?.name || 'N/A'}
              </Typography>
            </Box>
            {invoice.client?.email && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {invoice.client.email}
                </Typography>
              </Box>
            )}
            {invoice.client?.phone && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body1">
                  {invoice.client.phone}
                </Typography>
              </Box>
            )}
            {invoice.client?.address && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body1">
                  {invoice.client.address}
                </Typography>
              </Box>
            )}
            {invoice.project && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Proyecto
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1">
                    {invoice.project.name}
                  </Typography>
                </Box>
              </>
            )}
          </Grid>
          
          {/* Items */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Conceptos
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
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Totals */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
                <Typography variant="body1">IVA ({invoice.taxRate}%):</Typography>
                <Typography variant="body1">{formatCurrency(invoice.taxAmount)}</Typography>
              </Box>
              <Divider sx={{ width: '250px', my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Notes */}
          {invoice.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body1">
                {invoice.notes}
              </Typography>
            </Grid>
          )}
          
          {/* Terms */}
          {invoice.terms && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Términos y Condiciones
              </Typography>
              <Typography variant="body1">
                {invoice.terms}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={handlePaymentDialogClose}>
        <DialogTitle>Marcar como Pagada</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Fecha de Pago"
              type="date"
              name="paymentDate"
              value={paymentData.paymentDate}
              onChange={handlePaymentInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="payment-method-label">Método de Pago</InputLabel>
              <Select
                labelId="payment-method-label"
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handlePaymentInputChange}
                label="Método de Pago"
              >
                <MenuItem value="bank_transfer">Transferencia bancaria</MenuItem>
                <MenuItem value="credit_card">Tarjeta de crédito</MenuItem>
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Referencia de Pago"
              name="paymentReference"
              value={paymentData.paymentReference}
              onChange={handlePaymentInputChange}
              placeholder="Número de transacción, cheque, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleMarkAsPaid} 
            variant="contained" 
            color="primary"
            disabled={paymentLoading}
          >
            {paymentLoading ? <CircularProgress size={24} /> : 'Marcar como Pagada'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={handleEmailDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Enviar Factura por Email</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Destinatario"
              name="to"
              value={emailData.to}
              onChange={handleEmailInputChange}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Asunto"
              name="subject"
              value={emailData.subject}
              onChange={handleEmailInputChange}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Mensaje"
              name="message"
              value={emailData.message}
              onChange={handleEmailInputChange}
              multiline
              rows={8}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleSendEmail} 
            variant="contained" 
            color="primary"
            disabled={emailLoading || !emailData.to || !emailData.subject}
          >
            {emailLoading ? <CircularProgress size={24} /> : 'Enviar Email'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Eliminar Factura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar la factura #{invoice.number}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleDeleteInvoice} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceDetails;
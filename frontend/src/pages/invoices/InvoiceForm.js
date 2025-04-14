import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { es } from 'date-fns/locale';
import { getById, create, update } from '../../services/api/invoiceService';
import { getAll as getAllClients } from '../../services/api/clientService';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  
  const [invoice, setInvoice] = useState({
    number: '',
    date: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 días por defecto
    clientId: '',
    status: 'Pendiente',
    items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 21, // IVA por defecto
    taxAmount: 0,
    total: 0,
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    fetchClients();
    if (isEditMode) {
      fetchInvoice();
    }
  }, [id]);
  
  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.taxRate]);
  
  const fetchClients = async () => {
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      setError('Error al cargar los clientes: ' + (err.message || 'Inténtalo de nuevo'));
    }
  };
  
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await getById(id);
      
      // Convertir fechas de string a objetos Date
      data.date = new Date(data.date);
      data.dueDate = new Date(data.dueDate);
      
      setInvoice(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos de la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleDateChange = (name, date) => {
    setInvoice(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Limpiar error del campo cuando el usuario cambia la fecha
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = value;
    
    // Calcular el importe del ítem
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].amount = quantity * unitPrice;
    }
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };
  
  const removeItem = (index) => {
    if (invoice.items.length === 1) {
      return; // Mantener al menos un ítem
    }
    
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const total = subtotal + taxAmount;
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!invoice.number.trim()) {
      errors.number = 'El número de factura es obligatorio';
    }
    
    if (!invoice.clientId) {
      errors.clientId = 'Debe seleccionar un cliente';
    }
    
    if (!invoice.date) {
      errors.date = 'La fecha de emisión es obligatoria';
    }
    
    if (!invoice.dueDate) {
      errors.dueDate = 'La fecha de vencimiento es obligatoria';
    }
    
    // Validar ítems
    const itemErrors = [];
    invoice.items.forEach((item, index) => {
      const itemError = {};
      
      if (!item.description.trim()) {
        itemError.description = 'La descripción es obligatoria';
      }
      
      if (item.quantity <= 0) {
        itemError.quantity = 'La cantidad debe ser mayor que 0';
      }
      
      if (item.unitPrice < 0) {
        itemError.unitPrice = 'El precio no puede ser negativo';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode) {
        await update(id, invoice);
      } else {
        await create(invoice);
      }
      
      setSaving(false);
      navigate('/invoices');
    } catch (err) {
      setError('Error al guardar la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setSaving(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
            {isEditMode ? 'Editar Factura' : 'Nueva Factura'}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información General
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Número de Factura"
                  name="number"
                  value={invoice.number}
                  onChange={handleChange}
                  error={Boolean(formErrors.number)}
                  helperText={formErrors.number}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth error={Boolean(formErrors.clientId)}>
                  <InputLabel id="client-label">Cliente</InputLabel>
                  <Select
                    labelId="client-label"
                    name="clientId"
                    value={invoice.clientId}
                    onChange={handleChange}
                    label="Cliente"
                    required
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.clientId && (
                    <FormHelperText>{formErrors.clientId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de Emisión"
                    value={invoice.date}
                    onChange={(date) => handleDateChange('date', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={Boolean(formErrors.date)}
                        helperText={formErrors.date}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de Vencimiento"
                    value={invoice.dueDate}
                    onChange={(date) => handleDateChange('dueDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={Boolean(formErrors.dueDate)}
                        helperText={formErrors.dueDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={invoice.status}
                    onChange={handleChange}
                    label="Estado"
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="Pagada">Pagada</MenuItem>
                    <MenuItem value="Vencida">Vencida</MenuItem>
                    <MenuItem value="Anulada">Anulada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notes"
                  value={invoice.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Ítems de la Factura
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
              >
                Añadir Ítem
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          error={Boolean(formErrors.items?.[index]?.description)}
                          helperText={formErrors.items?.[index]?.description}
                          placeholder="Descripción del ítem"
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          error={Boolean(formErrors.items?.[index]?.quantity)}
                          helperText={formErrors.items?.[index]?.quantity}
                          inputProps={{ min: 1, step: 1 }}
                          variant="standard"
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          error={Boolean(formErrors.items?.[index]?.unitPrice)}
                          helperText={formErrors.items?.[index]?.unitPrice}
                          inputProps={{ min: 0, step: 0.01 }}
                          variant="standard"
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {/* Espacio vacío a la izquierda */}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>IVA:</Typography>
                    <TextField
                      type="number"
                      value={invoice.taxRate}
                      onChange={(e) => handleChange({ target: { name: 'taxRate', value: parseFloat(e.target.value) || 0 } })}
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      variant="standard"
                      sx={{ width: '60px' }}
                    />
                    <Typography variant="body1" sx={{ ml: 1 }}>%</Typography>
                  </Box>
                  <Typography variant="body1">{formatCurrency(invoice.taxAmount)}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              component={RouterLink}
              to="/invoices"
              sx={{ mr: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Factura'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default InvoiceForm;
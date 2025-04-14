import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { addDays } from 'date-fns';

import {
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  clearInvoiceError
} from '../redux/slices/invoiceSlice';
import { fetchClients } from '../redux/slices/clientSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchTimeEntriesByProject } from '../redux/slices/timeTrackingSlice';

const InvoiceFormPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { invoice, loading, error, success } = useSelector(state => state.invoices);
  const { clients } = useSelector(state => state.clients);
  const { projects } = useSelector(state => state.projects);
  const { timeEntries } = useSelector(state => state.timeTracking);
  
  const [formData, setFormData] = useState({
    number: '',
    date: new Date(),
    dueDate: addDays(new Date(), 30),
    clientId: '',
    projectId: '',
    status: 'draft',
    notes: '',
    items: [],
    subtotal: 0,
    taxRate: 21,
    taxAmount: 0,
    total: 0
  });
  
  const [errors, setErrors] = useState({});
  
  // Obtener el projectId de la URL si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('projectId');
    
    if (projectId) {
      setFormData(prev => ({
        ...prev,
        projectId
      }));
      
      // Buscar el proyecto para obtener el clientId
      const project = projects.find(p => p.id === projectId);
      if (project && project.clientId) {
        setFormData(prev => ({
          ...prev,
          clientId: project.clientId
        }));
      }
      
      // Cargar entradas de tiempo del proyecto
      dispatch(fetchTimeEntriesByProject(projectId));
    }
  }, [location.search, projects, dispatch]);
  
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchProjects());
    
    if (invoiceId) {
      dispatch(fetchInvoiceById(invoiceId));
    }
  }, [dispatch, invoiceId]);
  
  useEffect(() => {
    if (invoice && invoiceId) {
      setFormData({
        number: invoice.number || '',
        date: invoice.date ? new Date(invoice.date) : new Date(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : addDays(new Date(), 30),
        clientId: invoice.clientId || '',
        projectId: invoice.projectId || '',
        status: invoice.status || 'draft',
        notes: invoice.notes || '',
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 21,
        taxAmount: invoice.taxAmount || 0,
        total: invoice.total || 0
      });
    }
  }, [invoice, invoiceId]);
  
  useEffect(() => {
    if (success) {
      navigate('/invoices');
    }
  }, [success, navigate]);
  
  useEffect(() => {
    // Calcular totales cuando cambian los items o la tasa de impuestos
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [formData.items, formData.taxRate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando se edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
    
    // Limpiar error cuando se edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    
    setFormData({
      ...formData,
      projectId
    });
    
    if (projectId) {
      // Buscar el proyecto para obtener el clientId
      const project = projects.find(p => p.id === projectId);
      if (project && project.clientId) {
        setFormData(prev => ({
          ...prev,
          clientId: project.clientId
        }));
      }
      
      // Cargar entradas de tiempo del proyecto
      dispatch(fetchTimeEntriesByProject(projectId));
    }
  };
  
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          price: 0
        }
      ]
    });
  };
  
  const handleItemChange = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };
  
  const handleRemoveItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };
  
  const handleAddTimeEntries = () => {
    if (!timeEntries || timeEntries.length === 0 || !formData.projectId) return;
    
    // Agrupar entradas de tiempo por descripción
    const groupedEntries = timeEntries.reduce((acc, entry) => {
      if (!entry.billable || entry.invoiced) return acc;
      
      const key = entry.description || 'Tiempo sin descripción';
      if (!acc[key]) {
        acc[key] = {
          description: key,
          seconds: 0,
          entries: []
        };
      }
      
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);
      const seconds = (endTime - startTime) / 1000;
      
      acc[key].seconds += seconds;
      acc[key].entries.push(entry.id);
      
      return acc;
    }, {});
    
    // Convertir a items de factura
    const project = projects.find(p => p.id === formData.projectId);
    const hourlyRate = project?.hourlyRate || 0;
    
    const newItems = Object.values(groupedEntries).map(group => {
      const hours = group.seconds / 3600;
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        description: `${group.description} (${hours.toFixed(2)} horas)`,
        quantity: hours,
        price: hourlyRate,
        timeEntryIds: group.entries
      };
    });
    
    setFormData({
      ...formData,
      items: [...formData.items, ...newItems]
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientId) {
      newErrors.clientId = 'Selecciona un cliente';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es obligatoria';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Añade al menos un concepto a la factura';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.description) {
          newErrors[`items[${index}].description`] = 'La descripción es obligatoria';
        }
        if (item.quantity <= 0) {
          newErrors[`items[${index}].quantity`] = 'La cantidad debe ser mayor que 0';
        }
        if (item.price < 0) {
          newErrors[`items[${index}].price`] = 'El precio no puede ser negativo';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      const invoiceData = {
        ...formData,
        date: formData.date.toISOString(),
        dueDate: formData.dueDate.toISOString()
      };
      
      if (invoiceId) {
        dispatch(updateInvoice({ invoiceId, invoiceData }));
      } else {
        dispatch(createInvoice(invoiceData));
      }
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {invoiceId ? 'Editar Factura' : 'Nueva Factura'}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Guardar
          </Button>
          {invoiceId && (
            <>
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
            </>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearInvoiceError())}>
          {error}
        </Alert>
      )}
      
      {loading && !invoice && invoiceId ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detalles de la Factura
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Factura"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    error={!!errors.number}
                    helperText={errors.number}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Estado"
                    >
                      <MenuItem value="draft">Borrador</MenuItem>
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="paid">Pagada</MenuItem>
                      <MenuItem value="cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de Emisión"
                      value={formData.date}
                      onChange={(date) => handleDateChange('date', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.date}
                          helperText={errors.date}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de Vencimiento"
                      value={formData.dueDate}
                      onChange={(date) => handleDateChange('dueDate', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.dueDate}
                          helperText={errors.dueDate}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.clientId}>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      label="Cliente"
                    >
                      <MenuItem value="">Seleccionar Cliente</MenuItem>
                      {clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.clientId && (
                      <Typography variant="caption" color="error">
                        {errors.clientId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Proyecto</InputLabel>
                    <Select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleProjectChange}
                      label="Proyecto"
                    >
                      <MenuItem value="">Sin Proyecto</MenuItem>
                      {projects
                        .filter(project => !formData.clientId || project.clientId === formData.clientId)
                        .map(project => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Conceptos
                </Typography>
                <Box>
                  {formData.projectId && (
                    <Button
                      variant="outlined"
                      onClick={handleAddTimeEntries}
                      sx={{ mr: 1 }}
                    >
                      Añadir Tiempo Registrado
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                  >
                    Añadir Concepto
                  </Button>
                </Box>
              </Box>
              
              {errors.items && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {errors.items}
                </Typography>
              )}
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="50%">Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center" width="50px"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No hay conceptos. Haz clic en "Añadir Concepto" para agregar uno.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Descripción"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              error={!!errors[`items[${index}].description`]}
                              helperText={errors[`items[${index}].description`]}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0, step: 0.01 }}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              error={!!errors[`items[${index}].quantity`]}
                              helperText={errors[`items[${index}].quantity`]}
                              sx={{ width: '80px' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0, step: 0.01 }}
                              value={item.price}
                              onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              error={!!errors[`items[${index}].price`]}
                              helperText={errors[`items[${index}].price`]}
                              sx={{ width: '100px' }}
                              InputProps={{
                                startAdornment: '€',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            €{(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notas
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Notas o condiciones adicionales para la factura"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">€{formData.subtotal.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>IVA:</Typography>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      value={formData.taxRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0
                      })}
                      sx={{ width: '60px' }}
                      InputProps={{
                        endAdornment: '%',
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">€{formData.taxAmount.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold" align="right">
                      €{formData.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            {formData.clientId && clients.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Datos del Cliente
                </Typography>
                {(() => {
                  const client = clients.find(c => c.id === formData.clientId);
                  if (!client) return null;
                  
                  return (
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
                  );
                })()}
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default InvoiceFormPage;
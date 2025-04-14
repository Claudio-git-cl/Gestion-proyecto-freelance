// Actualizar las importaciones
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  PictureAsPdf,
  Send,
  Visibility,
  Download,
  Receipt,
  AttachMoney,
  CalendarToday,
  FilterList
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { 
  getInvoices, 
  createInvoice, 
  deleteInvoice, 
  generateInvoicePdf, 
  sendInvoiceByEmail 
} from '../redux/slices/invoiceSlice';
import { getProjects } from '../redux/slices/projectSlice';
import { getTimeEntries } from '../redux/slices/timeTrackingSlice';

// Este componente se completará cuando creemos el slice de facturas
// Por ahora, mostraremos una interfaz básica

// Actualizar el componente para usar el slice de facturas
// Agregar a las importaciones
import InvoiceDetails from '../components/invoices/InvoiceDetails';

const InvoicePage = () => {
  const dispatch = useDispatch();
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { timeEntries, loading: timeEntriesLoading } = useSelector(state => state.timeTracking);
  const { invoices, loading, error, success } = useSelector(state => state.invoices);
  const { user } = useSelector(state => state.auth);
  
  // Eliminamos la declaración duplicada de invoices
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    projectId: '',
    clientId: '',
    items: [],
    startDate: null,
    endDate: null,
    notes: ''
  });
  // Eliminamos la declaración duplicada de loading
  
  // Cargar facturas, proyectos y registros de tiempo
  useEffect(() => {
    dispatch(getInvoices());
    dispatch(getProjects());
  }, [dispatch]);
  
  // Cargar registros de tiempo cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject) {
      dispatch(getTimeEntries({ projectId: selectedProject }));
    }
  }, [dispatch, selectedProject]);
  
  // Función para abrir el diálogo de creación de factura
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setNewInvoice({
      projectId: '',
      clientId: '',
      items: [],
      startDate: null,
      endDate: null,
      notes: ''
    });
  };
  
  // Función para cerrar el diálogo de creación de factura
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };
  
  // Función para manejar cambios en el formulario de nueva factura
  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Función para manejar cambios en las fechas
  const handleDateChange = (name, date) => {
    setNewInvoice(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Función para agregar un ítem a la factura
  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ]
    }));
  };
  
  // Función para eliminar un ítem de la factura
  const handleRemoveItem = (itemId) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };
  
  // Función para manejar cambios en los ítems
  const handleItemChange = (itemId, field, value) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalcular el monto si cambia la cantidad o el precio unitario
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  // Función para crear la factura
  const handleCreateInvoice = () => {
    dispatch(createInvoice(newInvoice));
    setOpenCreateDialog(false);
  };
  
  // Función para descargar factura como PDF
  const handleDownloadInvoice = (invoiceId) => {
    dispatch(generateInvoicePdf(invoiceId));
  };
  
  // Función para eliminar factura
  const handleDeleteInvoice = (invoiceId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      dispatch(deleteInvoice(invoiceId));
    }
  };
  
  // Función para enviar factura por correo
  const handleSendInvoice = (invoiceId) => {
    const email = prompt('Ingresa el correo electrónico del destinatario:');
    if (email) {
      dispatch(sendInvoiceByEmail({ invoiceId, email }));
    }
  };
  
  // Verificar si el usuario es freelancer
  const isFreelancer = user && user.role === 'freelancer';
  
  if (!isFreelancer) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Facturación
        </Typography>
        <Alert severity="info">
          Esta funcionalidad está disponible solo para freelancers.
        </Alert>
      </Box>
    );
  }
  
  // Calcular el total de la factura
  const calculateTotal = () => {
    return newInvoice.items.reduce((total, item) => total + (item.amount || 0), 0);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Facturación
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Mis Facturas
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Crear Factura
        </Button>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : invoices.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Factura</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Proyecto</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>{invoice.project.title}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === 'Pagada' ? 'success' :
                        invoice.status === 'Pendiente' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  // Agregar estado para el diálogo de detalles
                  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
                  const [selectedInvoice, setSelectedInvoice] = useState(null);
                  
                  // Función para abrir el diálogo de detalles
                  const handleOpenDetailsDialog = (invoice) => {
                    setSelectedInvoice(invoice);
                    setOpenDetailsDialog(true);
                  };
                  
                  // Función para cerrar el diálogo de detalles
                  const handleCloseDetailsDialog = () => {
                    setOpenDetailsDialog(false);
                    setSelectedInvoice(null);
                  };
                  
                  <TableCell align="right">
                    <Tooltip title="Ver">
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenDetailsDialog(invoice)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar PDF">
                      <IconButton 
                        size="small"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Enviar">
                      <IconButton 
                        size="small"
                        onClick={() => handleSendInvoice(invoice.id)}
                      >
                        <Send />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes facturas creadas. Haz clic en "Crear Factura" para generar tu primera factura.
          </Typography>
        </Paper>
      )}
      
      {/* Diálogo para crear factura */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nueva Factura</DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="project-select-label">Proyecto</InputLabel>
                <Select
                  labelId="project-select-label"
                  name="projectId"
                  value={newInvoice.projectId}
                  onChange={handleNewInvoiceChange}
                  label="Proyecto"
                >
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="client-select-label">Cliente</InputLabel>
                <Select
                  labelId="client-select-label"
                  name="clientId"
                  value={newInvoice.clientId}
                  onChange={handleNewInvoiceChange}
                  label="Cliente"
                >
                  {projects
                    .filter(project => project.id === newInvoice.projectId)
                    .map(project => (
                      <MenuItem key={project.client.id} value={project.client.id}>
                        {project.client.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de inicio"
                  value={newInvoice.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de fin"
                  value={newInvoice.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Ítems de la Factura" />
              </Divider>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Importe</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newInvoice.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                            InputProps={{ inputProps: { min: 1 } }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${(item.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  size="small"
                >
                  Agregar Ítem
                </Button>
                
                <Typography variant="h6">
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                name="notes"
                value={newInvoice.notes}
                onChange={handleNewInvoiceChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateInvoice}
            disabled={!newInvoice.projectId || !newInvoice.clientId || newInvoice.items.length === 0}
          >
            Crear Factura
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicePage;
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { invoiceService, clientService } from '../../services/api';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (invoices.length > 0) {
      filterInvoices();
    }
  }, [searchTerm, statusFilter, clientFilter, invoices]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, clientsData] = await Promise.all([
        invoiceService.getAll(),
        clientService.getAll()
      ]);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setClients(clientsData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las facturas: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const filterInvoices = () => {
    let filtered = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.client && invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.clientId === clientFilter);
    }
    
    setFilteredInvoices(filtered);
    setPage(0);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleClientFilterChange = (e) => {
    setClientFilter(e.target.value);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    
    try {
      setLoading(true);
      await invoiceService.delete(invoiceToDelete.id);
      
      // Update invoice list
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== invoiceToDelete.id));
      setSuccess(`Factura "${invoiceToDelete.number}" eliminada correctamente`);
      
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      setLoading(false);
    } catch (err) {
      setError('Error al eliminar la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };
  
  const handleSendInvoice = async (invoice) => {
    try {
      setLoading(true);
      await invoiceService.sendInvoice(invoice.id);
      
      // Update invoice status in the list
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoice.id ? { ...inv, status: 'Enviada' } : inv
        )
      );
      
      setSuccess(`Factura "${invoice.number}" enviada correctamente`);
      setLoading(false);
    } catch (err) {
      setError('Error al enviar la factura: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pagada':
        return 'success';
      case 'Enviada':
        return 'primary';
      case 'Pendiente':
        return 'warning';
      case 'Vencida':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Facturas
          </Typography>
          
          <Button
            component={RouterLink}
            to="/invoices/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nueva Factura
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flexGrow: 1 }}
              variant="outlined"
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Estado"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Enviada">Enviada</MenuItem>
                <MenuItem value="Pagada">Pagada</MenuItem>
                <MenuItem value="Vencida">Vencida</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="client-filter-label">Cliente</InputLabel>
              <Select
                labelId="client-filter-label"
                id="client-filter"
                value={clientFilter}
                label="Cliente"
                onChange={handleClientFilterChange}
              >
                <MenuItem value="all">Todos los clientes</MenuItem>
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
        
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress sx={{ my: 3 }} />
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' ? 
                        'No se encontraron facturas con esos filtros' : 
                        'No hay facturas registradas'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{invoice.number}</Typography>
                        </TableCell>
                        <TableCell>
                          {invoice.client ? (
                            <RouterLink to={`/clients/${invoice.client.id}`} style={{ textDecoration: 'none' }}>
                              <Typography color="primary" variant="body2">
                                {invoice.client.name}
                              </Typography>
                            </RouterLink>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Cliente no disponible
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(invoice.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              component={RouterLink}
                              to={`/invoices/${invoice.id}`}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              component={RouterLink}
                              to={`/invoices/${invoice.id}/edit`}
                              size="small"
                              sx={{ mx: 1 }}
                              disabled={invoice.status === 'Pagada'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar PDF">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.status === 'Pendiente' && (
                            <Tooltip title="Enviar por email">
                              <IconButton
                                size="small"
                                onClick={() => handleSendInvoice(invoice)}
                                sx={{ mx: 1 }}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(invoice)}
                              disabled={invoice.status === 'Pagada'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInvoices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la factura "{invoiceToDelete?.number}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceList;
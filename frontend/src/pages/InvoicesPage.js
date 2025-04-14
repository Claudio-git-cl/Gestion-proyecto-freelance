import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { fetchInvoices, deleteInvoice } from '../redux/slices/invoiceSlice';
import { fetchClients } from '../redux/slices/clientSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { invoices, loading, error } = useSelector(state => state.invoices);
  const { clients } = useSelector(state => state.clients);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchClients());
  }, [dispatch]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  const handleClientFilterChange = (event) => {
    setClientFilter(event.target.value);
    setPage(0);
  };
  
  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
  };
  
  const handleCreateInvoice = () => {
    navigate('/invoices/new');
  };
  
  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };
  
  const handleEditInvoice = (invoiceId) => {
    navigate(`/invoices/edit/${invoiceId}`);
  };
  
  const handleDeleteClick = (invoice) => {
    setConfirmDelete(invoice);
  };
  
  const handleConfirmDelete = () => {
    if (confirmDelete) {
      dispatch(deleteInvoice(confirmDelete.id));
      setConfirmDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
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
  
  // Filtrar facturas
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      (invoice.number && invoice.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.id && invoice.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || invoice.status === statusFilter;
    
    const matchesClient = clientFilter === '' || invoice.clientId === clientFilter;
    
    let matchesDate = true;
    if (dateFilter === 'thisMonth') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const invoiceDate = new Date(invoice.date);
      matchesDate = invoiceDate >= firstDayOfMonth;
    } else if (dateFilter === 'lastMonth') {
      const today = new Date();
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const invoiceDate = new Date(invoice.date);
      matchesDate = invoiceDate >= firstDayOfLastMonth && invoiceDate < firstDayOfThisMonth;
    } else if (dateFilter === 'thisYear') {
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const invoiceDate = new Date(invoice.date);
      matchesDate = invoiceDate >= firstDayOfYear;
    }
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });
  
  // Ordenar facturas por fecha (más recientes primero)
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Paginar facturas
  const paginatedInvoices = sortedInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Calcular totales
  const totalPaid = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  const totalPending = invoices
    .filter(invoice => invoice.status === 'pending' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Facturas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateInvoice}
        >
          Nueva Factura
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: '1 1 300px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Total Cobrado
          </Typography>
          <Typography variant="h4" color="success.main">
            €{totalPaid.toFixed(2)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 300px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Pendiente de Cobro
          </Typography>
          <Typography variant="h4" color="warning.main">
            €{totalPending.toFixed(2)}
          </Typography>
        </Paper>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar factura..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flex: '1 1 200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="paid">Pagada</MenuItem>
              <MenuItem value="overdue">Vencida</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={clientFilter}
              onChange={handleClientFilterChange}
              label="Cliente"
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Fecha</InputLabel>
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              label="Fecha"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="thisMonth">Este mes</MenuItem>
              <MenuItem value="lastMonth">Mes pasado</MenuItem>
              <MenuItem value="thisYear">Este año</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !invoices.length ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron facturas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  
                  return (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        {invoice.number || `#${invoice.id.substring(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        {client ? client.name : 'Cliente desconocido'}
                      </TableCell>
                      <TableCell>
                        {invoice.date ? format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(invoice.status)}
                          color={getStatusColor(invoice.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        €{invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(invoice.id)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditInvoice(invoice.id)}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(invoice)}
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Imprimir"
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Enviar por email"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Descargar PDF"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
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
      
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Factura"
        content={`¿Estás seguro de que deseas eliminar la factura ${confirmDelete?.number || (confirmDelete ? `#${confirmDelete.id.substring(0, 8)}` : '')}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default InvoicesPage;
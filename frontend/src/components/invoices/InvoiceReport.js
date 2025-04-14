import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PictureAsPdf, BarChart, FilterList } from '@mui/icons-material';

const InvoiceReport = ({ invoices, projects, clients }) => {
  const [filters, setFilters] = useState({
    startDate: subMonths(new Date(), 3),
    endDate: new Date(),
    projectId: '',
    clientId: '',
    status: ''
  });
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Filtrar facturas según los criterios
  const filteredInvoices = invoices.filter(invoice => {
    const dateCondition = isWithinInterval(new Date(invoice.date), {
      start: filters.startDate,
      end: filters.endDate
    });
    
    const projectCondition = !filters.projectId || invoice.project.id === filters.projectId;
    const clientCondition = !filters.clientId || invoice.client.id === filters.clientId;
    const statusCondition = !filters.status || invoice.status === filters.status;
    
    return dateCondition && projectCondition && clientCondition && statusCondition;
  });
  
  // Calcular totales
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'Pagada')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = filteredInvoices
    .filter(invoice => invoice.status === 'Pendiente')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  // Agrupar por cliente
  const clientTotals = filteredInvoices.reduce((acc, invoice) => {
    const clientId = invoice.client.id;
    if (!acc[clientId]) {
      acc[clientId] = {
        name: invoice.client.name,
        total: 0,
        paid: 0,
        pending: 0
      };
    }
    
    acc[clientId].total += invoice.amount;
    if (invoice.status === 'Pagada') {
      acc[clientId].paid += invoice.amount;
    } else {
      acc[clientId].pending += invoice.amount;
    }
    
    return acc;
  }, {});
  
  // Agrupar por proyecto
  const projectTotals = filteredInvoices.reduce((acc, invoice) => {
    const projectId = invoice.project.id;
    if (!acc[projectId]) {
      acc[projectId] = {
        name: invoice.project.title,
        total: 0,
        paid: 0,
        pending: 0
      };
    }
    
    acc[projectId].total += invoice.amount;
    if (invoice.status === 'Pagada') {
      acc[projectId].paid += invoice.amount;
    } else {
      acc[projectId].pending += invoice.amount;
    }
    
    return acc;
  }, {});
  
  // Agrupar por mes
  const monthlyTotals = filteredInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.date);
    const monthKey = format(date, 'yyyy-MM');
    const monthName = format(date, 'MMMM yyyy', { locale: es });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        total: 0,
        paid: 0,
        pending: 0
      };
    }
    
    acc[monthKey].total += invoice.amount;
    if (invoice.status === 'Pagada') {
      acc[monthKey].paid += invoice.amount;
    } else {
      acc[monthKey].pending += invoice.amount;
    }
    
    return acc;
  }, {});
  
  // Ordenar meses cronológicamente
  const sortedMonths = Object.keys(monthlyTotals)
    .sort()
    .map(key => monthlyTotals[key]);
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Informe de Facturación
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de inicio"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de fin"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={filters.clientId}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
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
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={filters.projectId}
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
                label="Proyecto"
              >
                <MenuItem value="">Todos</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Pagada">Pagada</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            sx={{ ml: 1 }}
          >
            Exportar PDF
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Facturado
              </Typography>
              <Typography variant="h4">
                ${totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredInvoices.length} facturas
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Cobrado
              </Typography>
              <Typography variant="h4">
                ${paidAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                {filteredInvoices.filter(i => i.status === 'Pagada').length} facturas
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Pendiente
              </Typography>
              <Typography variant="h4">
                ${pendingAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                {filteredInvoices.filter(i => i.status === 'Pendiente').length} facturas
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Facturación por Cliente
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Cobrado</TableCell>
                    <TableCell align="right">Pendiente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(clientTotals).map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell align="right">${client.total.toFixed(2)}</TableCell>
                      <TableCell align="right">${client.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">${client.pending.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Facturación por Proyecto
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proyecto</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Cobrado</TableCell>
                    <TableCell align="right">Pendiente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(projectTotals).map((project, index) => (
                    <TableRow key={index}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell align="right">${project.total.toFixed(2)}</TableCell>
                      <TableCell align="right">${project.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">${project.pending.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Facturación Mensual
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mes</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Cobrado</TableCell>
                    <TableCell align="right">Pendiente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMonths.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.name}</TableCell>
                      <TableCell align="right">${month.total.toFixed(2)}</TableCell>
                      <TableCell align="right">${month.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">${month.pending.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {filteredInvoices.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalle de Facturas
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell align="right">Importe</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.number}</TableCell>
                    <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>{invoice.project.title}</TableCell>
                    <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={invoice.status}
                        color={
                          invoice.status === 'Pagada' ? 'success' :
                          invoice.status === 'Pendiente' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default InvoiceReport;
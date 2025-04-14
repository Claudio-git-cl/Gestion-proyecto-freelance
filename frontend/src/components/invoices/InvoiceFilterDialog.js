import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Grid,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';

const InvoiceFilterDialog = ({ open, onClose, onApply, currentFilters, clients, projects }) => {
  const [filters, setFilters] = useState({
    status: [],
    clientId: '',
    projectId: '',
    dateFrom: null,
    dateTo: null,
    minAmount: '',
    maxAmount: ''
  });
  
  useEffect(() => {
    if (open) {
      setFilters(currentFilters);
    }
  }, [open, currentFilters]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date
    });
  };
  
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  
  const handleClear = () => {
    setFilters({
      status: [],
      clientId: '',
      projectId: '',
      dateFrom: null,
      dateTo: null,
      minAmount: '',
      maxAmount: ''
    });
  };
  
  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagada' },
    { value: 'overdue', label: 'Vencida' },
    { value: 'cancelled', label: 'Cancelada' }
  ];
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrar Facturas</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    multiple
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    input={<OutlinedInput label="Estado" />}
                    renderValue={(selected) => selected.map(status => {
                      const option = statusOptions.find(opt => opt.value === status);
                      return option ? option.label : status;
                    }).join(', ')}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={filters.status.indexOf(option.value) > -1} />
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="clientId"
                    value={filters.clientId}
                    onChange={handleChange}
                    label="Cliente"
                  >
                    <MenuItem value="">Todos los clientes</MenuItem>
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Proyecto</InputLabel>
                  <Select
                    name="projectId"
                    value={filters.projectId}
                    onChange={handleChange}
                    label="Proyecto"
                  >
                    <MenuItem value="">Todos los proyectos</MenuItem>
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Rango de fechas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Desde"
                      value={filters.dateFrom}
                      onChange={(date) => handleDateChange('dateFrom', date)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Hasta"
                      value={filters.dateTo}
                      onChange={(date) => handleDateChange('dateTo', date)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Rango de importe
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Importe mínimo"
                      name="minAmount"
                      type="number"
                      value={filters.minAmount}
                      onChange={handleChange}
                      size="small"
                      InputProps={{
                        startAdornment: '€',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Importe máximo"
                      name="maxAmount"
                      type="number"
                      value={filters.maxAmount}
                      onChange={handleChange}
                      size="small"
                      InputProps={{
                        startAdornment: '€',
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="inherit">
          Limpiar
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained">
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceFilterDialog;
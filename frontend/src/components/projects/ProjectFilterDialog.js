import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';

const ProjectFilterDialog = ({ open, onClose, onApply, clients }) => {
  const [filters, setFilters] = useState({
    status: [],
    clientId: '',
    deadlineBefore: null,
    deadlineAfter: null
  });
  
  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value
    });
  };
  
  const handleClientChange = (e) => {
    setFilters({
      ...filters,
      clientId: e.target.value
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
      deadlineBefore: null,
      deadlineAfter: null
    });
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrar Proyectos</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={handleStatusChange}
                    label="Estado"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          let label = '';
                          let color = 'default';
                          
                          switch (value) {
                            case 'active':
                              label = 'Activo';
                              color = 'success';
                              break;
                            case 'paused':
                              label = 'En pausa';
                              color = 'warning';
                              break;
                            case 'completed':
                              label = 'Completado';
                              color = 'primary';
                              break;
                            case 'cancelled':
                              label = 'Cancelado';
                              color = 'error';
                              break;
                            default:
                              label = value;
                          }
                          
                          return (
                            <Chip key={value} label={label} size="small" color={color} />
                          );
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="paused">En pausa</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={filters.clientId}
                    onChange={handleClientChange}
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
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha límite
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Desde"
                      value={filters.deadlineAfter}
                      onChange={(date) => handleDateChange('deadlineAfter', date)}
                      renderInput={(params) => (
                        <Box sx={{ mt: 1 }}>
                          <TextField {...params} fullWidth />
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Hasta"
                      value={filters.deadlineBefore}
                      onChange={(date) => handleDateChange('deadlineBefore', date)}
                      renderInput={(params) => (
                        <Box sx={{ mt: 1 }}>
                          <TextField {...params} fullWidth />
                        </Box>
                      )}
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

export default ProjectFilterDialog;
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const TimeFilterDialog = ({ open, onClose, onApply, projects }) => {
  const [filterData, setFilterData] = useState({
    startDate: null,
    endDate: null,
    projectId: '',
    billable: null
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilterData({
      ...filterData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDateChange = (name, date) => {
    setFilterData({
      ...filterData,
      [name]: date
    });
  };
  
  const handleBillableChange = (e) => {
    const { checked } = e.target;
    setFilterData({
      ...filterData,
      billable: checked === null ? null : checked
    });
  };
  
  const handleApply = () => {
    onApply(filterData);
  };
  
  const handleClear = () => {
    setFilterData({
      startDate: null,
      endDate: null,
      projectId: '',
      billable: null
    });
  };
  
  const applyPresetFilter = (preset) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        setFilterData({
          ...filterData,
          startDate: today,
          endDate: today
        });
        break;
      case 'thisWeek':
        setFilterData({
          ...filterData,
          startDate: startOfWeek(today, { weekStartsOn: 1 }),
          endDate: endOfWeek(today, { weekStartsOn: 1 })
        });
        break;
      case 'thisMonth':
        setFilterData({
          ...filterData,
          startDate: startOfMonth(today),
          endDate: endOfMonth(today)
        });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        setFilterData({
          ...filterData,
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth)
        });
        break;
      default:
        break;
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrar Entradas de Tiempo</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filtros rápidos
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPresetFilter('today')}
                >
                  Hoy
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPresetFilter('thisWeek')}
                >
                  Esta semana
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPresetFilter('thisMonth')}
                >
                  Este mes
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPresetFilter('lastMonth')}
                >
                  Mes anterior
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha de inicio
                </Typography>
                <DatePicker
                  value={filterData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha de fin
                </Typography>
                <DatePicker
                  value={filterData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Grid>
            </Grid>
            
            <TextField
              select
              fullWidth
              label="Proyecto"
              name="projectId"
              value={filterData.projectId}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="">Todos los proyectos</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={filterData.billable === true}
                  onChange={handleBillableChange}
                  name="billable"
                  color="primary"
                />
              }
              label="Solo entradas facturables"
              sx={{ mt: 2, display: 'block' }}
            />
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

export default TimeFilterDialog;
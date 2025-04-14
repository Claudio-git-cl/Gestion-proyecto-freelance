import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const TimeReportDialog = ({ open, onClose, onGenerate, projects }) => {
  const [reportData, setReportData] = useState({
    reportType: 'summary',
    groupBy: 'project',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    projectId: '',
    includeNonBillable: true,
    format: 'pdf'
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setReportData({
      ...reportData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDateChange = (name, date) => {
    setReportData({
      ...reportData,
      [name]: date
    });
  };
  
  const handleGenerate = () => {
    onGenerate(reportData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generar Informe de Tiempo</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Tipo de informe</FormLabel>
                  <RadioGroup
                    name="reportType"
                    value={reportData.reportType}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="summary" 
                      control={<Radio />} 
                      label="Resumen" 
                    />
                    <FormControlLabel 
                      value="detailed" 
                      control={<Radio />} 
                      label="Detallado" 
                    />
                    <FormControlLabel 
                      value="invoice" 
                      control={<Radio />} 
                      label="Para facturación" 
                    />
                  </RadioGroup>
                </FormControl>
                
                <Box sx={{ mt: 3 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Agrupar por</FormLabel>
                    <RadioGroup
                      name="groupBy"
                      value={reportData.groupBy}
                      onChange={handleChange}
                    >
                      <FormControlLabel 
                        value="project" 
                        control={<Radio />} 
                        label="Proyecto" 
                      />
                      <FormControlLabel 
                        value="date" 
                        control={<Radio />} 
                        label="Fecha" 
                      />
                      <FormControlLabel 
                        value="client" 
                        control={<Radio />} 
                        label="Cliente" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Formato</FormLabel>
                    <RadioGroup
                      name="format"
                      value={reportData.format}
                      onChange={handleChange}
                    >
                      <FormControlLabel 
                        value="pdf" 
                        control={<Radio />} 
                        label="PDF" 
                      />
                      <FormControlLabel 
                        value="excel" 
                        control={<Radio />} 
                        label="Excel" 
                      />
                      <FormControlLabel 
                        value="csv" 
                        control={<Radio />} 
                        label="CSV" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Rango de fechas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Fecha de inicio"
                      value={reportData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Fecha de fin"
                      value={reportData.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" />
                      )}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  select
                  fullWidth
                  label="Proyecto"
                  name="projectId"
                  value={reportData.projectId}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Deja en blanco para incluir todos los proyectos"
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
                    <Radio
                      checked={reportData.includeNonBillable}
                      onChange={(e) => setReportData({
                        ...reportData,
                        includeNonBillable: e.target.checked
                      })}
                      name="includeNonBillable"
                      color="primary"
                    />
                  }
                  label="Incluir tiempo no facturable"
                  sx={{ mt: 2, display: 'block' }}
                />
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleGenerate} color="primary" variant="contained">
          Generar Informe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeReportDialog;
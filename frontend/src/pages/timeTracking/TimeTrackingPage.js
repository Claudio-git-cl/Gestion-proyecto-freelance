import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TimeTracker from '../../components/timeTracking/TimeTracker';
import TimeEntryList from '../../components/timeTracking/TimeEntryList';
import TimeEntryForm from '../../components/timeTracking/TimeEntryForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Mock data para desarrollo
const mockTimeEntries = [
  {
    id: 1,
    projectId: 1,
    projectName: 'Diseño de sitio web',
    description: 'Diseño de página de inicio',
    date: '2023-05-10',
    duration: 2.5,
    billable: true,
    hourlyRate: 25000,
    amount: 62500
  },
  {
    id: 2,
    projectId: 2,
    projectName: 'Desarrollo de aplicación móvil',
    description: 'Implementación de autenticación',
    date: '2023-05-11',
    duration: 4,
    billable: true,
    hourlyRate: 30000,
    amount: 120000
  },
  {
    id: 3,
    projectId: 3,
    projectName: 'Mantenimiento de plataforma',
    description: 'Corrección de errores',
    date: '2023-05-12',
    duration: 1.5,
    billable: false,
    hourlyRate: 0,
    amount: 0
  }
];

const TimeTrackingPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    entryId: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // En una aplicación real, esto sería una llamada a la API
    setTimeout(() => {
      setTimeEntries(mockTimeEntries);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveTimeEntry = (entry) => {
    if (entry.id) {
      // Actualizar entrada existente
      setTimeEntries(timeEntries.map(item => 
        item.id === entry.id ? entry : item
      ));
      showSnackbar('Entrada de tiempo actualizada correctamente', 'success');
    } else {
      // Crear nueva entrada
      const newEntry = {
        ...entry,
        id: Date.now() // Generar ID temporal
      };
      setTimeEntries([newEntry, ...timeEntries]);
      showSnackbar('Entrada de tiempo creada correctamente', 'success');
    }
  };

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setOpenForm(true);
  };

  const handleDeleteEntry = (entry) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar eliminación',
      content: '¿Estás seguro de que deseas eliminar esta entrada de tiempo? Esta acción no se puede deshacer.',
      entryId: entry.id
    });
  };

  const confirmDelete = () => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== confirmDialog.entryId));
    setConfirmDialog({ ...confirmDialog, open: false });
    showSnackbar('Entrada de tiempo eliminada correctamente', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Seguimiento de Tiempo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentEntry(null);
            setOpenForm(true);
          }}
        >
          Nueva entrada
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Cronómetro" />
          <Tab label="Entradas manuales" />
        </Tabs>
        <Divider />

        <Box sx={{ p: 2 }}>
          {tabValue === 0 ? (
            <TimeTracker onSaveTimeEntry={handleSaveTimeEntry} />
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" gutterBottom>
                Registra manualmente el tiempo dedicado a tus proyectos utilizando el botón "Nueva entrada".
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TimeEntryList
            timeEntries={timeEntries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Formulario de entrada de tiempo */}
      <TimeEntryForm
        timeEntry={currentEntry}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSaveTimeEntry}
      />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        content={confirmDialog.content}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimeTrackingPage;
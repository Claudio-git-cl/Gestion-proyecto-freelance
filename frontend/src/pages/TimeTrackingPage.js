import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { format, differenceInSeconds, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  fetchTimeEntries,
  fetchTimeEntriesByProject,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  startTimer,
  stopTimer,
  generateTimeReport,
  filterTimeEntries,
  clearTimeTrackingError,
  clearTimeTrackingSuccess
} from '../redux/slices/timeTrackingSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import TimeEntryForm from '../components/timeTracking/TimeEntryForm';
import TimeEntryList from '../components/timeTracking/TimeEntryList';
import TimeReportDialog from '../components/timeTracking/TimeReportDialog';
import TimeFilterDialog from '../components/timeTracking/TimeFilterDialog';
import ActiveTimer from '../components/timeTracking/ActiveTimer';

const TimeTrackingPage = () => {
  const dispatch = useDispatch();
  const { 
    timeEntries, 
    filteredEntries, 
    activeTimer, 
    loading, 
    error, 
    success 
  } = useSelector(state => state.timeTracking);
  const { projects } = useSelector(state => state.projects);
  
  const [openForm, setOpenForm] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    dispatch(fetchTimeEntries());
    dispatch(fetchProjects());
  }, [dispatch]);
  
  useEffect(() => {
    if (success) {
      setSuccessMessage('Operación completada con éxito');
      setTimeout(() => {
        dispatch(clearTimeTrackingSuccess());
      }, 3000);
    }
  }, [success, dispatch]);
  
  const handleOpenForm = () => {
    setEditingEntry(null);
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingEntry(null);
  };
  
  const handleOpenFilter = () => {
    setOpenFilter(true);
  };
  
  const handleCloseFilter = () => {
    setOpenFilter(false);
  };
  
  const handleOpenReport = () => {
    setOpenReport(true);
  };
  
  const handleCloseReport = () => {
    setOpenReport(false);
  };
  
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setOpenForm(true);
  };
  
  const handleDeleteEntry = (entryId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta entrada de tiempo?')) {
      dispatch(deleteTimeEntry(entryId));
    }
  };
  
  const handleStartTimer = (projectId) => {
    dispatch(startTimer(projectId));
  };
  
  const handleStopTimer = () => {
    if (activeTimer) {
      dispatch(stopTimer(activeTimer.id));
    }
  };
  
  const handleSubmitForm = (formData) => {
    if (editingEntry) {
      dispatch(updateTimeEntry({
        timeEntryId: editingEntry.id,
        timeEntryData: formData
      }));
    } else {
      dispatch(addTimeEntry(formData));
    }
    handleCloseForm();
  };
  
  const handleApplyFilter = (filterData) => {
    dispatch(filterTimeEntries(filterData));
    handleCloseFilter();
  };
  
  const handleGenerateReport = (reportParams) => {
    dispatch(generateTimeReport(reportParams));
    handleCloseReport();
  };
  
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  const calculateTotalHours = (entries) => {
    return entries.reduce((total, entry) => {
      if (entry.startTime && entry.endTime) {
        const seconds = differenceInSeconds(
          new Date(entry.endTime),
          new Date(entry.startTime)
        );
        return total + seconds;
      }
      return total;
    }, 0);
  };
  
  const totalSeconds = calculateTotalHours(filteredEntries);
  const totalHours = formatDuration(totalSeconds);
  
  const billableSeconds = calculateTotalHours(
    filteredEntries.filter(entry => entry.billable)
  );
  const billableHours = formatDuration(billableSeconds);
  
  if (loading && timeEntries.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Control de Tiempo
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleOpenFilter}
            sx={{ mr: 1 }}
          >
            Filtrar
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={handleOpenReport}
            sx={{ mr: 1 }}
          >
            Informes
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
          >
            Nueva Entrada
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearTimeTrackingError())}>
          {error}
        </Alert>
      )}
      
      {activeTimer && (
        <ActiveTimer
          timer={activeTimer}
          onStop={handleStopTimer}
          project={projects.find(p => p.id === activeTimer.projectId)}
        />
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tiempo Total
            </Typography>
            <Typography variant="h4">{totalHours}</Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredEntries.length} entradas de tiempo
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tiempo Facturable
            </Typography>
            <Typography variant="h4">{billableHours}</Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredEntries.filter(entry => entry.billable).length} entradas facturables
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Iniciar Temporizador
            </Typography>
            {!activeTimer ? (
              projects.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {projects
                    .filter(project => project.status === 'active')
                    .slice(0, 3)
                    .map(project => (
                      <Button
                        key={project.id}
                        variant="outlined"
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={() => handleStartTimer(project.id)}
                      >
                        {project.name}
                      </Button>
                    ))}
                  {projects.filter(project => project.status === 'active').length > 3 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleOpenForm}
                    >
                      Más proyectos...
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay proyectos activos disponibles
                </Typography>
              )
            ) : (
              <Typography variant="body2" color="text.secondary">
                Ya hay un temporizador activo
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <TimeEntryList
        entries={filteredEntries}
        projects={projects}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
      
      <TimeEntryForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        entry={editingEntry}
        projects={projects}
      />
      
      <TimeFilterDialog
        open={openFilter}
        onClose={handleCloseFilter}
        onApply={handleApplyFilter}
        projects={projects}
      />
      
      <TimeReportDialog
        open={openReport}
        onClose={handleCloseReport}
        onGenerate={handleGenerateReport}
        projects={projects}
      />
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Box>
  );
};

export default TimeTrackingPage;
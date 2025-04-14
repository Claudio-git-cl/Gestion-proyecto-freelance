import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Receipt as ReceiptIcon,
  Assignment as TaskIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

import { fetchProjectById, deleteProject } from '../redux/slices/projectSlice';
import { fetchTimeEntriesByProject } from '../redux/slices/timeTrackingSlice';
import { fetchTasksByProject } from '../redux/slices/taskSlice';
import { fetchInvoicesByProject } from '../redux/slices/invoiceSlice';
import ProjectDialog from '../components/projects/ProjectDialog';
import TimeEntryList from '../components/timeTracking/TimeEntryList';
import TaskList from '../components/tasks/TaskList';
import InvoiceList from '../components/invoices/InvoiceList';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { project, loading: projectLoading, error: projectError } = useSelector(state => state.projects);
  const { timeEntries, loading: timeLoading } = useSelector(state => state.timeTracking);
  const { tasks, loading: tasksLoading } = useSelector(state => state.tasks);
  const { invoices, loading: invoicesLoading } = useSelector(state => state.invoices);
  
  const [tabValue, setTabValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    dispatch(fetchTimeEntriesByProject(projectId));
    dispatch(fetchTasksByProject(projectId));
    dispatch(fetchInvoicesByProject(projectId));
  }, [dispatch, projectId]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditProject = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleDeleteProject = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(projectId));
      navigate('/projects');
    }
  };
  
  const handleStartTimer = () => {
    dispatch(startTimer(projectId));
  };
  
  const handleCreateInvoice = () => {
    navigate(`/invoices/new?projectId=${projectId}`);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'paused':
        return 'En pausa';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };
  
  const calculateTotalHours = () => {
    if (!timeEntries || timeEntries.length === 0) return 0;
    
    return timeEntries.reduce((total, entry) => {
      if (entry.startTime && entry.endTime) {
        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);
        const seconds = (endTime - startTime) / 1000;
        return total + seconds;
      }
      return total;
    }, 0) / 3600; // Convert seconds to hours
  };
  
  const calculateTotalBilled = () => {
    if (!invoices || invoices.length === 0) return 0;
    
    return invoices.reduce((total, invoice) => {
      return total + (invoice.total || 0);
    }, 0);
  };
  
  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / tasks.length) * 100;
  };
  
  if (projectLoading && !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (projectError) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{projectError}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Volver a Proyectos
        </Button>
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">Proyecto no encontrado</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Volver a Proyectos
        </Button>
      </Box>
    );
  }
  
  const totalHours = calculateTotalHours();
  const totalBilled = calculateTotalBilled();
  const progress = calculateProgress();
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {project.name}
        </Typography>
        <Box>
          <Tooltip title="Iniciar temporizador">
            <IconButton onClick={handleStartTimer} color="primary" sx={{ mr: 1 }}>
              <TimerIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Crear factura">
            <IconButton onClick={handleCreateInvoice} color="primary" sx={{ mr: 1 }}>
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar proyecto">
            <IconButton onClick={handleEditProject} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar proyecto">
            <IconButton onClick={handleDeleteProject} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Cliente: {project.client?.name || 'Sin cliente'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Fecha de creación: {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: es })}
                  </Typography>
                </Box>
                
                {project.deadline && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Fecha límite: {format(new Date(project.deadline), 'dd MMM yyyy', { locale: es })}
                      {new Date(project.deadline) > new Date() ? (
                        <Chip
                          label={`Faltan ${differenceInDays(new Date(project.deadline), new Date())} días`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      ) : (
                        <Chip
                          label="Vencido"
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Presupuesto: {project.budget ? `€${project.budget.toFixed(2)}` : 'No definido'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Tarifa por hora: {project.hourlyRate ? `€${project.hourlyRate.toFixed(2)}/h` : 'No definida'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Horas estimadas: {project.estimatedHours || 'No definidas'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Descripción:
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {project.description || 'Sin descripción'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Tiempo" icon={<TimerIcon />} iconPosition="start" />
              <Tab label="Tareas" icon={<TaskIcon />} iconPosition="start" />
              <Tab label="Facturas" icon={<ReceiptIcon />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Box>
                  {timeLoading ? (
                    <CircularProgress />
                  ) : (
                    <TimeEntryList
                      entries={timeEntries}
                      projects={[project]}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  )}
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  {tasksLoading ? (
                    <CircularProgress />
                  ) : (
                    <TaskList
                      tasks={tasks}
                      project={project}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  )}
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  {invoicesLoading ? (
                    <CircularProgress />
                  ) : (
                    <InvoiceList
                      invoices={invoices}
                      project={project}
                      onView={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado del Proyecto
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                label={getStatusLabel(project.status)}
                color={getStatusColor(project.status)}
                sx={{ fontSize: '1rem', py: 2, px: 3 }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Progreso
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Horas registradas
                </Typography>
                <Typography variant="h6">
                  {totalHours.toFixed(1)}h
                </Typography>
                {project.estimatedHours && (
                  <Typography variant="body2" color="text.secondary">
                    de {project.estimatedHours}h estimadas
                    ({Math.round((totalHours / project.estimatedHours) * 100)}%)
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Facturado
                </Typography>
                <Typography variant="h6">
                  €{totalBilled.toFixed(2)}
                </Typography>
                {project.budget && (
                  <Typography variant="body2" color="text.secondary">
                    de €{project.budget.toFixed(2)}
                    ({Math.round((totalBilled / project.budget) * 100)}%)
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimerIcon />}
                  onClick={handleStartTimer}
                >
                  Iniciar Tiempo
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TaskIcon />}
                  onClick={() => setTabValue(1)}
                >
                  Añadir Tarea
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                  onClick={handleCreateInvoice}
                >
                  Crear Factura
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditProject}
                >
                  Editar Proyecto
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <ProjectDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        project={project}
      />
    </Box>
  );
};

export default ProjectDetailsPage;
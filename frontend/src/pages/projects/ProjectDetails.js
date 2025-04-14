import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Timer as TimerIcon,
  Receipt as InvoiceIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { projectService, timeEntryService } from '../../services/api';
import Chart from 'react-apexcharts';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerLoading, setTimerLoading] = useState(false);
  
  useEffect(() => {
    fetchProjectData();
  }, [id]);
  
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectData = await projectService.getById(id);
      setProject(projectData);
      setClient(projectData.client);
      
      // Fetch project time entries
      const timeEntriesData = await timeEntryService.getByProjectId(id);
      setTimeEntries(timeEntriesData);
      
      // Fetch project stats
      const statsData = await projectService.getStats(id);
      setStats(statsData);
      
      // Check if there's an active timer
      const activeEntry = timeEntriesData.find(entry => entry.endTime === null);
      setTimerActive(!!activeEntry);
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del proyecto');
      setLoading(false);
    }
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await projectService.delete(id);
      setDeleteDialogOpen(false);
      navigate('/projects');
    } catch (err) {
      setError('Error al eliminar el proyecto');
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleStartTimer = async () => {
    try {
      setTimerLoading(true);
      await timeEntryService.startTimer(id);
      setTimerActive(true);
      fetchProjectData(); // Refresh data
      setTimerLoading(false);
    } catch (err) {
      setError('Error al iniciar el temporizador');
      setTimerLoading(false);
    }
  };
  
  const handleStopTimer = async () => {
    try {
      setTimerLoading(true);
      await timeEntryService.stopTimer(id);
      setTimerActive(false);
      fetchProjectData(); // Refresh data
      setTimerLoading(false);
    } catch (err) {
      setError('Error al detener el temporizador');
      setTimerLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'En progreso':
        return 'primary';
      case 'Pausado':
        return 'warning';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency || 'USD' 
    }).format(amount);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Proyecto no encontrado
        </Alert>
        <Button
          component={RouterLink}
          to="/projects"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista de proyectos
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              component={RouterLink}
              to="/projects"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>
            <Chip
              label={project.status}
              color={getStatusColor(project.status)}
              sx={{ ml: 2 }}
            />
          </Box>
          <Box>
            <Button
              variant={timerActive ? "outlined" : "contained"}
              color={timerActive ? "error" : "success"}
              startIcon={timerActive ? <PauseIcon /> : <PlayIcon />}
              onClick={timerActive ? handleStopTimer : handleStartTimer}
              disabled={timerLoading || project.status === 'Completado' || project.status === 'Cancelado'}
              sx={{ mr: 1 }}
            >
              {timerLoading ? 'Procesando...' : (timerActive ? 'Detener Tiempo' : 'Iniciar Tiempo')}
            </Button>
            <Button
              component={RouterLink}
              to={`/projects/${id}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Información del Proyecto
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Cliente"
                  secondary={
                    <RouterLink to={`/clients/${project.clientId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {client?.name} {client?.company ? `(${client?.company})` : ''}
                    </RouterLink>
                  }
                />
              </ListItem>
              {project.description && (
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Descripción"
                    secondary={project.description}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Fechas"
                  secondary={`${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No definida'} - ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No definida'}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Tarifa"
                  secondary={project.rate ? `${formatCurrency(project.rate, project.currency)} / hora` : 'No definida'}
                />
              </ListItem>
              {project.notes && (
                <ListItem>
                  <ListItemIcon>
                    <NotesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notas"
                    secondary={project.notes}
                  />
                </ListItem>
              )}
            </List>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {stats && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tiempo Total
                        </Typography>
                        <Typography variant="h5">
                          {formatDuration(stats.totalMinutes)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Importe Total
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(stats.totalAmount, project.currency)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Facturado
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(stats.invoicedAmount, project.currency)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pendiente
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(stats.pendingAmount, project.currency)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {stats.progress !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progreso: {stats.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.progress} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
                <Tab label="Registro de Tiempo" id="project-tab-0" aria-controls="project-tabpanel-0" />
                <Tab label="Facturas" id="project-tab-1" aria-controls="project-tabpanel-1" />
                {stats && <Tab label="Estadísticas" id="project-tab-2" aria-controls="project-tabpanel-2" />}
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Registro de Tiempo
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/time-entries/new?projectId=${id}`}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Añadir Entrada
                </Button>
              </Box>
              
              {timeEntries.length > 0 ? (
                <List>
                  {timeEntries.map(entry => (
                    <Card key={entry.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">
                              {entry.description || 'Sin descripción'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(entry.startTime).toLocaleString()}
                              {entry.endTime ? ` - ${new Date(entry.endTime).toLocaleString()}` : ' (En progreso)'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Typography variant="subtitle1">
                              {entry.endTime ? formatDuration(entry.durationMinutes) : 'En progreso'}
                            </Typography>
                            {entry.billable && (
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(entry.amount, project.currency)}
                              </Typography>
                            )}
                            {!entry.billable && (
                              <Chip size="small" label="No facturable" variant="outlined" />
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to={`/time-entries/${entry.id}/edit`}
                        >
                          Editar
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay registros de tiempo para este proyecto
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Facturas
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/invoices/new?projectId=${id}`}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Crear Factura
                </Button>
              </Box>
              
              {stats?.invoices && stats.invoices.length > 0 ? (
                <List>
                  {stats.invoices.map(invoice => (
                    <Card key={invoice.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">
                              Factura #{invoice.number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Fecha: {new Date(invoice.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vencimiento: {new Date(invoice.dueDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Typography variant="subtitle1">
                              {formatCurrency(invoice.total, project.currency)}
                            </Typography>
                            <Chip 
                              label={invoice.status} 
                              size="small" 
                              color={
                                invoice.status === 'Pagada' ? 'success' :
                                invoice.status === 'Pendiente' ? 'warning' :
                                invoice.status === 'Vencida' ? 'error' : 'default'
                              }
                              sx={{ mt: 1 }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to={`/invoices/${invoice.id}`}
                        >
                          Ver Detalles
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay facturas asociadas a este proyecto
                </Typography>
              )}
            </TabPanel>
            
            {stats && (
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Estadísticas
                </Typography>
                
                {stats.timeByWeek && stats.timeByWeek.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tiempo por Semana
                    </Typography>
                    <Chart
                      options={{
                        chart: {
                          id: 'time-by-week',
                          toolbar: {
                            show: false
                          }
                        },
                        xaxis: {
                          categories: stats.timeByWeek.map(item => item.week)
                        },
                        yaxis: {
                          title: {
                            text: 'Horas'
                          }
                        },
                        colors: ['#3f51b5']
                      }}
                      series={[
                        {
                          name: 'Horas',
                          data: stats.timeByWeek.map(item => (item.minutes / 60).toFixed(2))
                        }
                      ]}
                      type="bar"
                      height={300}
                    />
                  </Box>
                )}
                
                {stats.timeByTask && stats.timeByTask.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tiempo por Tarea
                    </Typography>
                    <Chart
                      options={{
                        chart: {
                          id: 'time-by-task',
                          toolbar: {
                            show: false
                          }
                        },
                        labels: stats.timeByTask.map(item => item.task || 'Sin categoría'),
                        colors: ['#3f51b5', '#f50057', '#00bcd4', '#ff9800', '#4caf50', '#9c27b0']
                      }}
                      series={stats.timeByTask.map(item => item.minutes / 60)}
                      type="pie"
                      height={300}
                    />
                  </Box>
                )}
              </TabPanel>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el proyecto "{project.name}"? Esta acción no se puede deshacer.
            {timeEntries.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 2, color: 'error.main' }}>
                ¡Advertencia! Este proyecto tiene {timeEntries.length} registro(s) de tiempo asociado(s) que también se eliminarán.
              </Box>
            )}
            {stats?.invoices && stats.invoices.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                ¡Advertencia! Este proyecto tiene {stats.invoices.length} factura(s) asociada(s) que también se eliminarán.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails;
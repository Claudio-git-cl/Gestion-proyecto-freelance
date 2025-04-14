import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Assignment as ProjectIcon,
  People as ClientIcon,
  Receipt as InvoiceIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchClients } from '../redux/slices/clientSlice';
import { fetchInvoices } from '../redux/slices/invoiceSlice';
import { fetchTimeEntries } from '../redux/slices/timeTrackingSlice';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { clients, loading: clientsLoading } = useSelector(state => state.clients);
  const { invoices, loading: invoicesLoading } = useSelector(state => state.invoices);
  const { timeEntries, loading: timeEntriesLoading } = useSelector(state => state.timeTracking);
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    totalHours: 0
  });
  
  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchClients());
    dispatch(fetchInvoices());
    dispatch(fetchTimeEntries());
  }, [dispatch]);
  
  useEffect(() => {
    if (projects && clients && invoices && timeEntries) {
      // Calcular estadísticas
      const activeProjects = projects.filter(project => project.status === 'active').length;
      const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
      const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
      const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.status === 'paid' ? invoice.total : 0), 0);
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      
      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        paidInvoices,
        pendingInvoices,
        totalRevenue,
        totalHours
      });
    }
  }, [projects, clients, invoices, timeEntries]);
  
  // Datos para el gráfico de ingresos mensuales
  const revenueChartOptions = {
    chart: {
      id: 'monthly-revenue',
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    },
    colors: ['#4caf50'],
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Ingresos Mensuales',
      align: 'left'
    }
  };
  
  const revenueChartSeries = [
    {
      name: 'Ingresos',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 150, 200, 190]
    }
  ];
  
  // Datos para el gráfico de proyectos por estado
  const projectStatusChartOptions = {
    chart: {
      id: 'project-status',
      type: 'donut'
    },
    labels: ['Activos', 'Completados', 'En pausa', 'Cancelados'],
    colors: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
    title: {
      text: 'Estado de Proyectos',
      align: 'left'
    },
    legend: {
      position: 'bottom'
    }
  };
  
  const projectStatusChartSeries = [
    stats.activeProjects,
    projects.filter(project => project.status === 'completed').length,
    projects.filter(project => project.status === 'paused').length,
    projects.filter(project => project.status === 'cancelled').length
  ];
  
  // Datos para el gráfico de facturas por estado
  const invoiceStatusChartOptions = {
    chart: {
      id: 'invoice-status',
      type: 'donut'
    },
    labels: ['Pagadas', 'Pendientes', 'Vencidas'],
    colors: ['#4caf50', '#ff9800', '#f44336'],
    title: {
      text: 'Estado de Facturas',
      align: 'left'
    },
    legend: {
      position: 'bottom'
    }
  };
  
  const invoiceStatusChartSeries = [
    stats.paidInvoices,
    stats.pendingInvoices,
    invoices.filter(invoice => invoice.status === 'overdue').length
  ];
  
  const isLoading = projectsLoading || clientsLoading || invoicesLoading || timeEntriesLoading;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Bienvenido, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí tienes un resumen de tu actividad freelance.
        </Typography>
      </Box>
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Proyectos
              </Typography>
              <ProjectIcon color="primary" />
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalProjects}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stats.activeProjects} activos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Clientes
              </Typography>
              <ClientIcon color="primary" />
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalClients}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total de clientes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Ingresos
              </Typography>
              <MoneyIcon color="primary" />
            </Box>
            <Typography component="p" variant="h4">
              ${stats.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total facturado
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Horas
              </Typography>
              <TimeIcon color="primary" />
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalHours}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Horas registradas
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Chart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height={350}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Chart
                  options={projectStatusChartOptions}
                  series={projectStatusChartSeries}
                  type="donut"
                  height={200}
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Chart
                  options={invoiceStatusChartOptions}
                  series={invoiceStatusChartSeries}
                  type="donut"
                  height={200}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Proyectos recientes y facturas pendientes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Proyectos Recientes"
              action={
                <Button component={Link} to="/projects" size="small">
                  Ver todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {projects.length > 0 ? (
                <List>
                  {projects.slice(0, 5).map((project) => (
                    <ListItem
                      key={project.id}
                      component={Link}
                      to={`/projects/${project.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: project.status === 'active' ? 'success.main' : 'grey.500' }}>
                          <ProjectIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={project.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Cliente: {project.client?.name || 'N/A'}
                            </Typography>
                            <br />
                            <Chip
                              label={project.status}
                              size="small"
                              color={
                                project.status === 'active' ? 'success' :
                                project.status === 'completed' ? 'primary' :
                                project.status === 'paused' ? 'warning' : 'error'
                              }
                              sx={{ mt: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay proyectos para mostrar
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Facturas Pendientes"
              action={
                <Button component={Link} to="/invoices" size="small">
                  Ver todas
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {invoices.filter(invoice => invoice.status !== 'paid').length > 0 ? (
                <List>
                  {invoices
                    .filter(invoice => invoice.status !== 'paid')
                    .slice(0, 5)
                    .map((invoice) => (
                      <ListItem
                        key={invoice.id}
                        component={Link}
                        to={`/invoices/${invoice.id}`}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: invoice.status === 'overdue' ? 'error.main' : 'warning.main' }}>
                            {invoice.status === 'overdue' ? <WarningIcon /> : <InvoiceIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Factura #${invoice.number}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                ${invoice.total.toLocaleString()} - {invoice.client?.name || 'N/A'}
                              </Typography>
                              <br />
                              <Chip
                                label={invoice.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                                size="small"
                                color={invoice.status === 'overdue' ? 'error' : 'warning'}
                                sx={{ mt: 1 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay facturas pendientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
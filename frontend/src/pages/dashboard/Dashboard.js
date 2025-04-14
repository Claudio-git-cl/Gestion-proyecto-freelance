import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../../services/api';

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      hoursThisWeek: 0,
      pendingInvoices: 0,
      totalEarnings: 0,
      activeProjects: 0,
      activeClients: 0,
      monthlyEarnings: 0
    },
    recentProjects: [],
    timeByProject: [],
    earningsByMonth: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener resumen del dashboard
        const summary = await dashboardService.getSummary();
        
        // Obtener tiempo por proyecto
        const timeByProject = await dashboardService.getTimeByProject();
        
        // Obtener ingresos por mes
        const earningsByMonth = await dashboardService.getEarningsByMonth();
        
        setDashboardData({
          stats: summary.stats,
          recentProjects: summary.recentProjects,
          timeByProject,
          earningsByMonth
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { stats, recentProjects, timeByProject, earningsByMonth } = dashboardData;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Horas esta semana
            </Typography>
            <Typography variant="h3" color="primary">
              {stats.hoursThisWeek}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Facturas pendientes
            </Typography>
            <Typography variant="h3" color="warning.main">
              {stats.pendingInvoices}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ingresos del mes
            </Typography>
            <Typography variant="h3" color="success.main">
              ${stats.monthlyEarnings.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Proyectos activos
            </Typography>
            <Typography variant="h3" color="info.main">
              {stats.activeProjects}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Clientes activos
            </Typography>
            <Typography variant="h3" color="secondary.main">
              {stats.activeClients}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Por cobrar
            </Typography>
            <Typography variant="h3" color="error.main">
              ${stats.totalEarnings.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos y listas */}
      <Grid container spacing={3}>
        {/* Gráfico de ingresos por mes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ingresos por mes
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={earningsByMonth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Proyectos recientes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Proyectos recientes
            </Typography>
            <List>
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <React.Fragment key={project.id}>
                    <ListItem>
                      <ListItemText
                        primary={project.name}
                        secondary={`Cliente: ${project.client}`}
                      />
                    </ListItem>
                    {index < recentProjects.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No hay proyectos recientes" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Gráfico de tiempo por proyecto */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tiempo por proyecto
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {timeByProject.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeByProject}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="hours"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeByProject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} horas`, 'Tiempo']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No hay datos de tiempo registrados
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Espacio para otro gráfico o información */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de facturas
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {/* Aquí podría ir otro gráfico o información relevante */}
              <Typography variant="body1" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Información de facturas pendientes y pagadas
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
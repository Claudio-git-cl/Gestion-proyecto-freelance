import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInSeconds } from 'date-fns';
import { getTimeEntries } from '../redux/slices/timeTrackingSlice';
import { getProjects } from '../redux/slices/projectsSlice';

const TimeReportsPage = () => {
  const dispatch = useDispatch();
  const { timeEntries, loading, error } = useSelector(state => state.timeTracking);
  const { projects } = useSelector(state => state.projects);
  
  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedProject, setSelectedProject] = useState('');
  
  // Cargar proyectos y entradas de tiempo al montar el componente
  useEffect(() => {
    dispatch(getProjects());
    loadTimeEntries();
  }, [dispatch]);
  
  // Cargar entradas de tiempo cuando cambian los filtros
  useEffect(() => {
    loadTimeEntries();
  }, [reportType, startDate, endDate, selectedProject]);
  
  // Función para cargar entradas de tiempo con filtros
  const loadTimeEntries = () => {
    const filters = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
    
    if (selectedProject) {
      filters.projectId = selectedProject;
    }
    
    dispatch(getTimeEntries(filters));
  };
  
  // Manejar cambio de tipo de informe
  const handleReportTypeChange = (event) => {
    const type = event.target.value;
    setReportType(type);
    
    // Ajustar fechas según el tipo de informe
    if (type === 'weekly') {
      setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
      setEndDate(endOfWeek(new Date(), { weekStartsOn: 1 }));
    } else if (type === 'monthly') {
      setStartDate(startOfMonth(new Date()));
      setEndDate(endOfMonth(new Date()));
    } else if (type === 'custom') {
      // Mantener las fechas actuales
    }
  };
  
  // Formatear duración en formato HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Formatear duración en horas para gráficos
  const formatDurationHours = (seconds) => {
    return Math.round((seconds / 3600) * 100) / 100;
  };
  
  // Obtener nombre del proyecto
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Proyecto desconocido';
  };
  
  // Calcular duración total
  const calculateTotalDuration = () => {
    return timeEntries.reduce((total, entry) => {
      if (!entry.endTime) return total;
      
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      return total + differenceInSeconds(end, start);
    }, 0);
  };
  
  // Preparar datos para el gráfico por proyecto
  const prepareProjectChartData = () => {
    const projectDurations = {};
    
    timeEntries.forEach(entry => {
      if (!entry.endTime) return;
      
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const duration = differenceInSeconds(end, start);
      
      const projectName = getProjectName(entry.projectId);
      
      if (!projectDurations[projectName]) {
        projectDurations[projectName] = 0;
      }
      
      projectDurations[projectName] += duration;
    });
    
    return Object.entries(projectDurations).map(([name, duration]) => ({
      name,
      hours: formatDurationHours(duration)
    }));
  };
  
  // Preparar datos para el gráfico por día
  const prepareDailyChartData = () => {
    const dailyDurations = {};
    
    timeEntries.forEach(entry => {
      if (!entry.endTime) return;
      
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const duration = differenceInSeconds(end, start);
      
      const day = format(start, 'yyyy-MM-dd');
      const dayFormatted = format(start, 'dd/MM');
      
      if (!dailyDurations[day]) {
        dailyDurations[day] = {
          date: dayFormatted,
          hours: 0
        };
      }
      
      dailyDurations[day].hours += formatDurationHours(duration);
    });
    
    return Object.values(dailyDurations).sort((a, b) => 
      new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))
    );
  };
  
  // Colores para el gráfico de pastel
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Datos para los gráficos
  const projectChartData = prepareProjectChartData();
  const dailyChartData = prepareDailyChartData();
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Informes de Tiempo
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Tipo de Informe</InputLabel>
              <Select
                labelId="report-type-label"
                value={reportType}
                onChange={handleReportTypeChange}
                label="Tipo de Informe"
              >
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de inicio"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={reportType !== 'custom'}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={reportType !== 'custom'}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="project-filter-label">Proyecto</InputLabel>
              <Select
                labelId="project-filter-label"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Proyecto"
              >
                <MenuItem value="">Todos los proyectos</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : timeEntries.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tiempo Total
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {formatDuration(calculateTotalDuration())}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Proyectos
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {new Set(timeEntries.map(entry => entry.projectId)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Entradas
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {timeEntries.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Tiempo por Proyecto
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="hours"
                      >
                        {projectChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} horas`, 'Tiempo']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Tiempo por Día
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} horas`, 'Tiempo']} />
                      <Legend />
                      <Bar dataKey="hours" name="Horas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Inicio</TableCell>
                    <TableCell>Fin</TableCell>
                    <TableCell>Duración</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map(entry => {
                    const start = new Date(entry.startTime);
                    const end = entry.endTime ? new Date(entry.endTime) : null;
                    const duration = end ? differenceInSeconds(end, start) : 0;
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{getProjectName(entry.projectId)}</TableCell>
                        <TableCell>{entry.description || '-'}</TableCell>
                        <TableCell>{format(start, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(start, 'HH:mm')}</TableCell>
                        <TableCell>
                          {end ? format(end, 'HH:mm') : 'En curso'}
                        </TableCell>
                        <TableCell>
                          {end ? formatDuration(duration) : 'En curso'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay datos de tiempo para el período seleccionado.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default TimeReportsPage;
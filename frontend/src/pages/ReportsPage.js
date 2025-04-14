import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { BarChart, AttachMoney, QueryStats } from '@mui/icons-material';
import { getInvoices } from '../redux/slices/invoiceSlice';
import { getProjects } from '../redux/slices/projectSlice';
import { getClients } from '../redux/slices/clientSlice';
import InvoiceReport from '../components/invoices/InvoiceReport';
import InvoiceCharts from '../components/invoices/InvoiceCharts';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { invoices, loading: invoicesLoading } = useSelector(state => state.invoices);
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { clients, loading: clientsLoading } = useSelector(state => state.clients);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(getInvoices());
    dispatch(getProjects());
    dispatch(getClients());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Preparar datos para los gráficos
  const prepareChartData = () => {
    // Agrupar por mes
    const monthlyData = invoices.reduce((acc, invoice) => {
      const date = new Date(invoice.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM yyyy', { locale: es });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthName,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      
      acc[monthKey].total += invoice.amount;
      if (invoice.status === 'Pagada') {
        acc[monthKey].paid += invoice.amount;
      } else if (invoice.status === 'Pendiente') {
        acc[monthKey].pending += invoice.amount;
      }
      
      return acc;
    }, {});
    
    // Ordenar meses cronológicamente
    const sortedMonths = Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
    
    // Agrupar por cliente
    const clientData = invoices.reduce((acc, invoice) => {
      const clientId = invoice.client.id;
      if (!acc[clientId]) {
        acc[clientId] = {
          name: invoice.client.name,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      
      acc[clientId].total += invoice.amount;
      if (invoice.status === 'Pagada') {
        acc[clientId].paid += invoice.amount;
      } else if (invoice.status === 'Pendiente') {
        acc[clientId].pending += invoice.amount;
      }
      
      return acc;
    }, {});
    
    // Agrupar por proyecto
    const projectData = invoices.reduce((acc, invoice) => {
      const projectId = invoice.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          name: invoice.project.title,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      
      acc[projectId].total += invoice.amount;
      if (invoice.status === 'Pagada') {
        acc[projectId].paid += invoice.amount;
      } else if (invoice.status === 'Pendiente') {
        acc[projectId].pending += invoice.amount;
      }
      
      return acc;
    }, {});
    
    return {
      monthlyData: sortedMonths,
      clientData,
      projectData
    };
  };

  const loading = invoicesLoading || projectsLoading || clientsLoading;
  const { monthlyData, clientData, projectData } = prepareChartData();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Informes y Estadísticas
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab icon={<QueryStats />} label="Informes" />
            <Tab icon={<BarChart />} label="Gráficos" />
          </Tabs>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Alert severity="info">
            No hay datos de facturación disponibles para generar informes.
          </Alert>
        ) : (
          <Box>
            {tabValue === 0 && (
              <InvoiceReport
                invoices={invoices}
                projects={projects}
                clients={clients}
              />
            )}
            
            {tabValue === 1 && (
              <InvoiceCharts
                invoices={invoices}
                monthlyData={monthlyData}
                clientData={clientData}
                projectData={projectData}
              />
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ReportsPage;
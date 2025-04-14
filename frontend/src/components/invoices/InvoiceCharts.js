import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InvoiceCharts = ({ invoices, monthlyData, clientData, projectData }) => {
  // Preparar datos para el gráfico de estado de facturas
  const statusData = [
    { name: 'Pagadas', value: invoices.filter(i => i.status === 'Pagada').length },
    { name: 'Pendientes', value: invoices.filter(i => i.status === 'Pendiente').length },
    { name: 'Canceladas', value: invoices.filter(i => i.status === 'Cancelada').length }
  ].filter(item => item.value > 0);

  // Preparar datos para el gráfico de clientes
  const clientChartData = Object.values(clientData)
    .map(client => ({
      name: client.name,
      total: client.total,
      paid: client.paid,
      pending: client.pending
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5 clientes

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gráficos de Facturación
      </Typography>
      
      <Grid container spacing={3}>
        {/* Gráfico de facturación mensual */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Facturación Mensual
            </Typography>
            
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="paid" name="Cobrado" stackId="a" fill="#4caf50" />
                  <Bar dataKey="pending" name="Pendiente" stackId="a" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráficos de distribución */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado de Facturas
            </Typography>
            
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráfico de top clientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Clientes
            </Typography>
            
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={clientChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráfico de tendencia de facturación */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tendencia de Facturación
            </Typography>
            
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Facturado" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="paid" name="Total Cobrado" stroke="#4caf50" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceCharts;
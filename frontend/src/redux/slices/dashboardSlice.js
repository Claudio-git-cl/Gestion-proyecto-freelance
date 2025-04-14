import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk para obtener los datos del dashboard
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      // En un entorno real, esto sería una llamada a la API
      // Por ahora, simulamos una respuesta con datos de ejemplo
      // const response = await axios.get('/api/dashboard');
      // return response.data;
      
      // Simulación de retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      return {
        projectStats: {
          total: 12,
          active: 5,
          completed: 7
        },
        financialStats: {
          totalIncome: 15000,
          monthlyIncome: 2500,
          pendingPayments: 3200
        },
        timeStats: {
          totalHours: 450,
          monthlyHours: 65,
          weeklyHours: 18
        },
        clientStats: {
          total: 8,
          active: 5
        },
        recentProjects: [
          {
            id: 'p1',
            name: 'Diseño de sitio web corporativo',
            client: 'Empresa ABC',
            status: 'En progreso',
            deadline: '2023-12-15'
          },
          {
            id: 'p2',
            name: 'Desarrollo de aplicación móvil',
            client: 'Startup XYZ',
            status: 'En progreso',
            deadline: '2023-11-30'
          },
          {
            id: 'p3',
            name: 'Rediseño de marca',
            client: 'Consultora 123',
            status: 'Completado',
            deadline: '2023-10-20'
          }
        ],
        recentInvoices: [
          {
            id: 'i1',
            number: 'INV-2023-001',
            client: 'Empresa ABC',
            amount: 1500,
            status: 'Pagada',
            date: '2023-10-15'
          },
          {
            id: 'i2',
            number: 'INV-2023-002',
            client: 'Startup XYZ',
            amount: 2000,
            status: 'Pendiente',
            date: '2023-10-30'
          },
          {
            id: 'i3',
            number: 'INV-2023-003',
            client: 'Consultora 123',
            amount: 800,
            status: 'Vencida',
            date: '2023-09-30'
          }
        ],
        upcomingDeadlines: [
          {
            id: 'd1',
            title: 'Entrega de diseño final',
            type: 'Proyecto',
            date: '2023-11-15',
            link: '/projects/p1'
          },
          {
            id: 'd2',
            title: 'Vencimiento de factura INV-2023-002',
            type: 'Factura',
            date: '2023-10-30',
            link: '/invoices/i2'
          },
          {
            id: 'd3',
            title: 'Reunión con cliente',
            type: 'Evento',
            date: '2023-11-05',
            link: '/calendar/e1'
          }
        ],
        recentActivities: [
          {
            id: 'a1',
            type: 'Proyecto',
            description: 'Proyecto "Diseño de sitio web corporativo" actualizado',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            link: '/projects/p1'
          },
          {
            id: 'a2',
            type: 'Factura',
            description: 'Factura INV-2023-001 marcada como pagada',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            link: '/invoices/i1'
          },
          {
            id: 'a3',
            type: 'Tiempo',
            description: 'Registradas 3 horas en "Desarrollo de aplicación móvil"',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            link: '/time-tracking'
          },
          {
            id: 'a4',
            type: 'Cliente',
            description: 'Nuevo cliente "Consultora 123" añadido',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            link: '/clients/c3'
          },
          {
            id: 'a5',
            type: 'Comentario',
            description: 'Nuevo comentario en proyecto "Rediseño de marca"',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            link: '/projects/p3'
          }
        ],
        projects: [
          { id: 'p1', name: 'Diseño de sitio web corporativo' },
          { id: 'p2', name: 'Desarrollo de aplicación móvil' },
          { id: 'p3', name: 'Rediseño de marca' },
          { id: 'p4', name: 'Campaña de marketing digital' },
          { id: 'p5', name: 'Desarrollo de API REST' }
        ]
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener datos del dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    loading: false,
    data: null,
    error: null
  },
  reducers: {
    clearDashboardData: (state) => {
      state.data = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al obtener datos del dashboard';
      });
  }
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
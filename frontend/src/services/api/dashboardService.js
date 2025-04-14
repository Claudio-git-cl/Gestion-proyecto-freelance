import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/dashboard`;

const dashboardService = {
  getSummary: async () => {
    try {
      const response = await axios.get(`${API_URL}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  // Método para obtener datos de prueba mientras se desarrolla el backend
  getMockData: () => {
    return {
      summary: {
        activeProjects: 5,
        totalClients: 8,
        monthlyHours: 120.5,
        totalRevenue: 15000
      },
      recentProjects: [
        { id: 1, name: 'Diseño Web E-commerce', client: { name: 'Empresa ABC' }, status: 'En progreso' },
        { id: 2, name: 'Desarrollo App Móvil', client: { name: 'Cliente XYZ' }, status: 'En progreso' },
        { id: 3, name: 'Mantenimiento Sitio Web', client: { name: 'Empresa 123' }, status: 'Completado' }
      ],
      recentInvoices: [
        { id: 1, number: '2023-001', client: { name: 'Empresa ABC' }, total: 2500 },
        { id: 2, number: '2023-002', client: { name: 'Cliente XYZ' }, total: 1800 },
        { id: 3, number: '2023-003', client: { name: 'Empresa 123' }, total: 950 }
      ],
      timeStats: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        hours: [80, 95, 110, 85, 120, 130]
      },
      revenueStats: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        invoiced: [2500, 3000, 2800, 3200, 3500, 4000],
        paid: [2500, 3000, 2800, 2500, 2000, 1500]
      }
    };
  }
};

export default dashboardService;
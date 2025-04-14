import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/tasks`;

const taskService = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  create: async (taskData) => {
    try {
      const response = await axios.post(API_URL, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  update: async (id, taskData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  // Método para obtener datos de prueba
  getMockTasks: () => {
    return [
      { 
        id: 1, 
        title: 'Diseñar página de inicio', 
        description: 'Crear diseño responsive para la página principal',
        project: { id: 1, name: 'Diseño Web E-commerce' },
        status: 'Completada',
        priority: 'Alta',
        dueDate: '2023-02-01',
        estimatedHours: 8,
        actualHours: 10
      },
      { 
        id: 2, 
        title: 'Implementar carrito de compras', 
        description: 'Desarrollar funcionalidad de carrito con gestión de productos',
        project: { id: 1, name: 'Diseño Web E-commerce' },
        status: 'En progreso',
        priority: 'Alta',
        dueDate: '2023-02-15',
        estimatedHours: 16,
        actualHours: 12
      },
      { 
        id: 3, 
        title: 'Diseñar interfaz de usuario', 
        description: 'Crear mockups para todas las pantallas de la aplicación',
        project: { id: 2, name: 'Desarrollo App Móvil' },
        status: 'Pendiente',
        priority: 'Media',
        dueDate: '2023-03-01',
        estimatedHours: 20,
        actualHours: 0
      }
    ];
  }
};

export default taskService;
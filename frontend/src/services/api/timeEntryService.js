import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/time-entries`;

const timeEntryService = {
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

  create: async (timeEntryData) => {
    try {
      const response = await axios.post(API_URL, timeEntryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  update: async (id, timeEntryData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, timeEntryData);
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
  getMockTimeEntries: () => {
    return [
      { 
        id: 1, 
        project: { id: 1, name: 'Diseño Web E-commerce' },
        task: { id: 1, title: 'Diseñar página de inicio' },
        date: '2023-01-20',
        hours: 4,
        description: 'Diseño inicial de la página de inicio'
      },
      { 
        id: 2, 
        project: { id: 1, name: 'Diseño Web E-commerce' },
        task: { id: 1, title: 'Diseñar página de inicio' },
        date: '2023-01-21',
        hours: 6,
        description: 'Finalización del diseño y ajustes responsive'
      },
      { 
        id: 3, 
        project: { id: 1, name: 'Diseño Web E-commerce' },
        task: { id: 2, title: 'Implementar carrito de compras' },
        date: '2023-02-05',
        hours: 8,
        description: 'Inicio de implementación del carrito de compras'
      }
    ];
  }
};

export default timeEntryService;
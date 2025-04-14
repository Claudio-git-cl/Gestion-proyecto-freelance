import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/projects`;

const getAll = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const getById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const create = async (projectData) => {
  try {
    const response = await axios.post(API_URL, projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const update = async (id, projectData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const deleteProject = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

// Método para obtener datos de prueba
const getMockProjects = () => {
  return [
    {
      id: 1,
      name: 'Diseño Web E-commerce',
      clientId: 1,
      clientName: 'Empresa ABC',
      startDate: '2023-01-15',
      endDate: '2023-03-30',
      status: 'Completado',
      budget: 5000,
      description: 'Diseño y desarrollo de tienda online para productos electrónicos'
    },
    {
      id: 2,
      name: 'Desarrollo App Móvil',
      clientId: 2,
      clientName: 'Cliente XYZ',
      startDate: '2023-03-01',
      endDate: '2023-06-30',
      status: 'En progreso',
      budget: 8000,
      description: 'Aplicación móvil para gestión de inventario'
    },
    {
      id: 3,
      name: 'Mantenimiento Sitio Web',
      clientId: 3,
      clientName: 'Empresa 123',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      status: 'En progreso',
      budget: 3600,
      description: 'Mantenimiento mensual y actualizaciones de contenido'
    }
  ];
};

export {
  getAll,
  getById,
  create,
  update,
  deleteProject as delete,
  getMockProjects
};
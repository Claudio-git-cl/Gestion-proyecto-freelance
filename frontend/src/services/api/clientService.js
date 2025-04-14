import axios from 'axios';
import { clientsApi } from '../mockApi';

// Determinar si usamos la API real o la simulada
const USE_MOCK_API = true; // Cambiar a false cuando tengamos un backend real

const API_URL = process.env.REACT_APP_API_URL + '/clients';

const getAll = async () => {
  try {
    if (USE_MOCK_API) {
      return await clientsApi.getAll();
    }
    
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const getById = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await clientsApi.getById(id);
    }
    
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const create = async (clientData) => {
  try {
    if (USE_MOCK_API) {
      return await clientsApi.create(clientData);
    }
    
    const response = await axios.post(API_URL, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const update = async (id, clientData) => {
  try {
    if (USE_MOCK_API) {
      return await clientsApi.update(id, clientData);
    }
    
    const response = await axios.put(`${API_URL}/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const deleteClient = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await clientsApi.delete(id);
    }
    
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

export {
  getAll,
  getById,
  create,
  update,
  deleteClient
};
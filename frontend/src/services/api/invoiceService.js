import axios from 'axios';
import { invoicesApi } from '../mockApi';

// Determinar si usamos la API real o la simulada
const USE_MOCK_API = true; // Cambiar a false cuando tengamos un backend real

const API_URL = process.env.REACT_APP_API_URL + '/invoices';

const getAll = async (filters = {}) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.getAll(filters);
    }
    
    const params = new URLSearchParams();
    
    if (filters.clientId) {
      params.append('clientId', filters.clientId);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const getById = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.getById(id);
    }
    
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const create = async (invoiceData) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.create(invoiceData);
    }
    
    const response = await axios.post(API_URL, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const update = async (id, invoiceData) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.update(id, invoiceData);
    }
    
    const response = await axios.put(`${API_URL}/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const deleteInvoice = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.delete(id);
    }
    
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const markAsPaid = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.markAsPaid(id);
    }
    
    const response = await axios.post(`${API_URL}/${id}/mark-as-paid`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const sendReminder = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.sendReminder(id);
    }
    
    const response = await axios.post(`${API_URL}/${id}/send-reminder`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const sendByEmail = async (id) => {
  try {
    if (USE_MOCK_API) {
      return await invoicesApi.sendByEmail(id);
    }
    
    const response = await axios.post(`${API_URL}/${id}/send-email`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

const exportToPdf = async (id) => {
  try {
    if (USE_MOCK_API) {
      // En modo simulado, la descarga del PDF se maneja en el cliente
      return { success: true };
    }
    
    const response = await axios.get(`${API_URL}/${id}/pdf`, {
      responseType: 'blob'
    });
    
    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Factura_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || error.message || error;
  }
};

export {
  getAll,
  getById,
  create,
  update,
  deleteInvoice,
  markAsPaid,
  sendReminder,
  sendByEmail,
  exportToPdf
};
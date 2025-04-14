import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/auth`;

// Configurar interceptor para incluir el token en las solicitudes
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/change-password`, { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || error;
    }
  },

  // Método para simular autenticación durante desarrollo
  mockLogin: (email, password) => {
    const mockUser = {
      id: 1,
      name: 'Usuario Demo',
      email: 'demo@example.com',
      role: 'admin'
    };
    
    const mockToken = 'mock-jwt-token';
    localStorage.setItem('token', mockToken);
    
    return {
      user: mockUser,
      token: mockToken
    };
  }
};

export default authService;
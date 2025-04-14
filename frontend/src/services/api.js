import axios from 'axios';

// Configuración base de axios
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autenticación a las peticiones
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await API.put('/auth/profile', userData);
    return response.data;
  },
  changePassword: async (passwordData) => {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  }
};

// Servicios de clientes
export const clientService = {
  getAll: async () => {
    const response = await API.get('/clients');
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/clients/${id}`);
    return response.data;
  },
  create: async (client) => {
    const response = await API.post('/clients', client);
    return response.data;
  },
  update: async (id, client) => {
    const response = await API.put(`/clients/${id}`, client);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/clients/${id}`);
    return response.data;
  }
};

// Servicios de proyectos
export const projectService = {
  getAll: async () => {
    const response = await API.get('/projects');
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  },
  create: async (project) => {
    const response = await API.post('/projects', project);
    return response.data;
  },
  update: async (id, project) => {
    const response = await API.put(`/projects/${id}`, project);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
  },
  addTask: async (projectId, task) => {
    const response = await API.post(`/projects/${projectId}/tasks`, task);
    return response.data;
  },
  updateTask: async (projectId, taskId, task) => {
    const response = await API.put(`/projects/${projectId}/tasks/${taskId}`, task);
    return response.data;
  },
  deleteTask: async (projectId, taskId) => {
    const response = await API.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  }
};

// Servicios de entradas de tiempo
export const timeEntryService = {
  getAll: async (filters) => {
    const response = await API.get('/time-entries', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/time-entries/${id}`);
    return response.data;
  },
  create: async (timeEntry) => {
    const response = await API.post('/time-entries', timeEntry);
    return response.data;
  },
  update: async (id, timeEntry) => {
    const response = await API.put(`/time-entries/${id}`, timeEntry);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/time-entries/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await API.get('/time-entries/stats');
    return response.data;
  }
};

// Servicios de facturas
export const invoiceService = {
  getAll: async (filters) => {
    const response = await API.get('/invoices', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/invoices/${id}`);
    return response.data;
  },
  create: async (invoice) => {
    const response = await API.post('/invoices', invoice);
    return response.data;
  },
  update: async (id, invoice) => {
    const response = await API.put(`/invoices/${id}`, invoice);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/invoices/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await API.put(`/invoices/${id}/status`, { status });
    return response.data;
  },
  generatePdf: async (id) => {
    const response = await API.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Servicios de dashboard
export const dashboardService = {
  getSummary: async () => {
    const response = await API.get('/dashboard/summary');
    return response.data;
  },
  getTimeByProject: async () => {
    const response = await API.get('/dashboard/time-by-project');
    return response.data;
  },
  getEarningsByMonth: async () => {
    const response = await API.get('/dashboard/earnings-by-month');
    return response.data;
  }
};

export default API;
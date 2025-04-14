import apiService from './apiService';

const BASE_URL = '/clients';

const clientService = {
  /**
   * Obtener todos los clientes con filtrado opcional
   * @param {Object} filtros - Parámetros de filtrado
   * @returns {Promise} - Respuesta de la API
   */
  getClients: (filtros = {}) => {
    return apiService.get(BASE_URL, filtros)
      .then(response => response.data);
  },
  
  /**
   * Obtener cliente por ID
   * @param {string|number} id - ID del cliente
   * @returns {Promise} - Respuesta de la API
   */
  getClientById: (id) => {
    return apiService.get(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Crear nuevo cliente
   * @param {Object} clienteData - Datos del cliente
   * @returns {Promise} - Respuesta de la API
   */
  createClient: (clienteData) => {
    return apiService.post(BASE_URL, clienteData)
      .then(response => response.data);
  },
  
  /**
   * Actualizar cliente existente
   * @param {string|number} id - ID del cliente
   * @param {Object} clienteData - Datos actualizados del cliente
   * @returns {Promise} - Respuesta de la API
   */
  updateClient: (id, clienteData) => {
    return apiService.put(`${BASE_URL}/${id}`, clienteData)
      .then(response => response.data);
  },
  
  /**
   * Eliminar cliente
   * @param {string|number} id - ID del cliente
   * @returns {Promise} - Respuesta de la API
   */
  deleteClient: (id) => {
    return apiService.delete(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Obtener proyectos de un cliente
   * @param {string|number} clientId - ID del cliente
   * @returns {Promise} - Respuesta de la API
   */
  getClientProjects: (clientId) => {
    return apiService.get(`${BASE_URL}/${clientId}/projects`)
      .then(response => response.data);
  },
  
  /**
   * Obtener facturas de un cliente
   * @param {string|number} clientId - ID del cliente
   * @returns {Promise} - Respuesta de la API
   */
  getClientInvoices: (clientId) => {
    return apiService.get(`${BASE_URL}/${clientId}/invoices`)
      .then(response => response.data);
  },
  
  /**
   * Importar clientes desde archivo CSV
   * @param {FormData} formData - Datos del formulario con archivo CSV
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise} - Respuesta de la API
   */
  importClients: (formData, onProgress = null) => {
    return apiService.upload(`${BASE_URL}/import`, formData, onProgress)
      .then(response => response.data);
  },
  
  /**
   * Exportar clientes a formato CSV o Excel
   * @param {Object} filtros - Parámetros de filtrado
   * @param {string} formato - Formato de exportación (csv, xlsx)
   * @returns {Promise} - Respuesta de la API
   */
  exportClients: (filtros = {}, formato = 'xlsx') => {
    return apiService.download(`${BASE_URL}/export`, { ...filtros, formato }, `clientes.${formato}`)
      .then(response => response.data);
  },
  
  /**
   * Obtener estadísticas de clientes
   * @returns {Promise} - Respuesta de la API
   */
  getClientStats: () => {
    return apiService.get(`${BASE_URL}/stats`)
      .then(response => response.data);
  }
};

export default clientService;
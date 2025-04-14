import apiService from './apiService';

const BASE_URL = '/notifications';

const notificationService = {
  /**
   * Obtener todas las notificaciones del usuario
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} - Respuesta de la API
   */
  getNotifications: (params = {}) => {
    return apiService.get(BASE_URL, params)
      .then(response => response.data);
  },
  
  /**
   * Obtener notificación por ID
   * @param {string|number} id - ID de la notificación
   * @returns {Promise} - Respuesta de la API
   */
  getNotificationById: (id) => {
    return apiService.get(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Marcar notificación como leída
   * @param {string|number} id - ID de la notificación
   * @returns {Promise} - Respuesta de la API
   */
  markAsRead: (id) => {
    return apiService.put(`${BASE_URL}/${id}/read`)
      .then(response => response.data);
  },
  
  /**
   * Marcar todas las notificaciones como leídas
   * @returns {Promise} - Respuesta de la API
   */
  markAllAsRead: () => {
    return apiService.put(`${BASE_URL}/read-all`)
      .then(response => response.data);
  },
  
  /**
   * Eliminar notificación
   * @param {string|number} id - ID de la notificación
   * @returns {Promise} - Respuesta de la API
   */
  deleteNotification: (id) => {
    return apiService.delete(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Eliminar todas las notificaciones
   * @returns {Promise} - Respuesta de la API
   */
  deleteAllNotifications: () => {
    return apiService.delete(`${BASE_URL}/delete-all`)
      .then(response => response.data);
  },
  
  /**
   * Actualizar preferencias de notificación
   * @param {Object} preferences - Preferencias de notificación
   * @returns {Promise} - Respuesta de la API
   */
  updateNotificationPreferences: (preferences) => {
    return apiService.put(`${BASE_URL}/preferences`, preferences)
      .then(response => response.data);
  },
  
  /**
   * Obtener preferencias de notificación
   * @returns {Promise} - Respuesta de la API
   */
  getNotificationPreferences: () => {
    return apiService.get(`${BASE_URL}/preferences`)
      .then(response => response.data);
  }
};

export default notificationService;
import apiService from './apiService';

const BASE_URL = '/auth';

const authService = {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales de usuario
   * @returns {Promise} - Respuesta de la API
   */
  login: (credentials) => {
    return apiService.post(`${BASE_URL}/login`, credentials)
      .then(response => {
        // Guardar token en localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data;
      });
  },
  
  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Respuesta de la API
   */
  register: (userData) => {
    return apiService.post(`${BASE_URL}/register`, userData)
      .then(response => {
        // Guardar token en localStorage si se inicia sesión automáticamente
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data;
      });
  },
  
  /**
   * Cerrar sesión
   * @returns {Promise} - Respuesta de la API
   */
  logout: () => {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
    
    // Llamar al endpoint de logout (opcional)
    return apiService.post(`${BASE_URL}/logout`)
      .then(response => response.data)
      .catch(() => {
        // Ignorar errores en caso de que el servidor no esté disponible
        return { success: true };
      });
  },
  
  /**
   * Verificar estado de autenticación
   * @returns {Promise} - Respuesta de la API
   */
  checkAuthStatus: () => {
    return apiService.get(`${BASE_URL}/me`)
      .then(response => response.data)
      .catch(error => {
        // Si hay un error, eliminar el token
        localStorage.removeItem('token');
        throw error;
      });
  },
  
  /**
   * Solicitar restablecimiento de contraseña
   * @param {Object} data - Datos para restablecer contraseña
   * @returns {Promise} - Respuesta de la API
   */
  requestPasswordReset: (data) => {
    return apiService.post(`${BASE_URL}/forgot-password`, data)
      .then(response => response.data);
  },
  
  /**
   * Restablecer contraseña
   * @param {Object} data - Datos para restablecer contraseña
   * @returns {Promise} - Respuesta de la API
   */
  resetPassword: (data) => {
    return apiService.post(`${BASE_URL}/reset-password`, data)
      .then(response => response.data);
  },
  
  /**
   * Actualizar perfil de usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} - Respuesta de la API
   */
  updateProfile: (userData) => {
    return apiService.put(`${BASE_URL}/profile`, userData)
      .then(response => response.data);
  },
  
  /**
   * Cambiar contraseña
   * @param {Object} passwordData - Datos de contraseña
   * @returns {Promise} - Respuesta de la API
   */
  changePassword: (passwordData) => {
    return apiService.put(`${BASE_URL}/change-password`, passwordData)
      .then(response => response.data);
  },
  
  /**
   * Subir avatar de usuario
   * @param {FormData} formData - Datos del formulario con imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise} - Respuesta de la API
   */
  uploadAvatar: (formData, onProgress = null) => {
    return apiService.upload(`${BASE_URL}/avatar`, formData, onProgress)
      .then(response => response.data);
  },
  
  /**
   * Verificar si el token es válido
   * @returns {boolean} - Verdadero si hay un token almacenado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
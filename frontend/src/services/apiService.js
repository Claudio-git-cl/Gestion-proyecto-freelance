import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for cache busting if needed
    if (config.bustCache) {
      const timestamp = new Date().getTime();
      config.params = { ...config.params, _t: timestamp };
      delete config.bustCache;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    handleApiError(error);
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  /**
   * Perform GET request
   * @param {string} url - API endpoint
   * @param {Object} params - URL parameters
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  get: (url, params = {}, config = {}) => {
    return api.get(url, { ...config, params });
  },
  
  /**
   * Perform POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },
  
  /**
   * Perform PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },
  
  /**
   * Perform PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },
  
  /**
   * Perform DELETE request
   * @param {string} url - API endpoint
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
  
  /**
   * Upload file(s)
   * @param {string} url - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Axios promise
   */
  upload: (url, formData, onProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        : undefined,
    });
  },
  
  /**
   * Download file
   * @param {string} url - API endpoint
   * @param {Object} params - URL parameters
   * @param {string} filename - Name to save the file as
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Axios promise
   */
  download: (url, params = {}, filename = null, onProgress = null) => {
    return api.get(url, {
      params,
      responseType: 'blob',
      onDownloadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        : undefined,
    }).then(response => {
      // Create blob link to download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = response.headers['content-disposition'];
      let extractedFilename = null;
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          extractedFilename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename || extractedFilename || 'download';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      return response;
    });
  },
  
  /**
   * Cancel all pending requests
   */
  cancelRequests: () => {
    if (apiService.cancelToken) {
      apiService.cancelToken.cancel('Request canceled by user');
    }
    
    // Create new cancel token for future requests
    apiService.cancelToken = axios.CancelToken.source();
  },
  
  // Cancel token source
  cancelToken: axios.CancelToken.source()
};

export default apiService;
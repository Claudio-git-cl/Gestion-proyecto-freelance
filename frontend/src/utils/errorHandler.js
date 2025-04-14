import { toast } from 'react-toastify';

/**
 * Global error handler for API requests
 * @param {Error} error - The error object
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @param {Function} callback - Callback function to execute after error handling (optional)
 */
export const handleApiError = (error, dispatch = null, callback = null) => {
  // Extract error message
  const errorMessage = error.response?.data?.message || error.message || 'Ha ocurrido un error inesperado';
  
  // Log error to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }
  
  // Show toast notification
  toast.error(errorMessage);
  
  // Handle specific error codes
  if (error.response) {
    switch (error.response.status) {
      case 401: // Unauthorized
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
        
      case 403: // Forbidden
        // Handle forbidden access
        break;
        
      case 404: // Not found
        // Handle resource not found
        break;
        
      case 422: // Validation error
        // Handle validation errors
        break;
        
      case 500: // Server error
        // Handle server errors
        break;
        
      default:
        // Handle other status codes
        break;
    }
  }
  
  // Execute callback if provided
  if (callback && typeof callback === 'function') {
    callback(errorMessage);
  }
  
  return errorMessage;
};

/**
 * Format validation errors from API response
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted errors object
 */
export const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  if (errors && typeof errors === 'object') {
    Object.keys(errors).forEach(key => {
      formattedErrors[key] = Array.isArray(errors[key]) 
        ? errors[key][0] 
        : errors[key];
    });
  }
  
  return formattedErrors;
};
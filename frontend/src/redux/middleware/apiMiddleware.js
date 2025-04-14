import axios from 'axios';
import { API_URL } from '../../config';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API middleware for Redux
const apiMiddleware = () => (next) => async (action) => {
  // If the action doesn't have the API property, pass it to the next middleware
  if (!action.api) {
    return next(action);
  }

  const { 
    api: { url, method = 'GET', data = null, headers = {} },
    types: [requestType, successType, failureType],
    onSuccess,
    onError
  } = action;

  // Dispatch request action
  next({ type: requestType });

  try {
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make API call
    const response = await api({
      url,
      method,
      data,
      headers
    });

    // Dispatch success action
    const successAction = {
      type: successType,
      payload: response.data
    };
    next(successAction);

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess(response.data, successAction);
    }

    return response.data;
  } catch (error) {
    // Prepare error message
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';

    // Dispatch failure action
    const failureAction = {
      type: failureType,
      error: errorMessage,
      meta: {
        status: error.response?.status
      }
    };
    next(failureAction);

    // Call onError callback if provided
    if (onError) {
      onError(errorMessage, failureAction);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(errorMessage);
  }
};

export default apiMiddleware;
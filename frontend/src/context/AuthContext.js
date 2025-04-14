import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

// Create the authentication context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un token almacenado
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      // Verificar la validez del token con el backend
      authService.getCurrentUser()
        .then(userData => {
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        })
        .catch(err => {
          console.error('Error al verificar usuario:', err);
          // Si hay un error, limpiar el almacenamiento
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response;
      
      setCurrentUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(userData);
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
      return false;
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      await authService.changePassword(passwordData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
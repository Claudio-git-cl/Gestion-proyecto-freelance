import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Para desarrollo, usamos datos simulados
            // En producción, descomentar la siguiente línea
            // const userData = await authService.getCurrentUser();
            const userData = { id: 1, name: 'Usuario Demo', email: 'demo@example.com' };
            setCurrentUser(userData);
          } catch (err) {
            console.error('Error verificando sesión:', err);
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Error general:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      // Para desarrollo, usamos datos simulados
      // En producción, descomentar la siguiente línea
      // const data = await authService.login(email, password);
      const data = {
        user: { id: 1, name: 'Usuario Demo', email: 'demo@example.com' },
        token: 'mock-token-123456'
      };
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  const logout = async () => {
    try {
      // En producción, descomentar la siguiente línea
      // await authService.logout();
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
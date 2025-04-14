import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GuestGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Puedes mostrar un spinner o pantalla de carga aquí
    return <div>Cargando...</div>;
  }

  if (isAuthenticated) {
    // Redirigir al dashboard si ya está autenticado
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestGuard;
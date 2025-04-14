import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { currentUser } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <Box
        component="header"
        sx={{
          py: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Freelance App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión de proyectos para freelancers
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Freelance App. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
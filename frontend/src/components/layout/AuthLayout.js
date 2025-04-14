import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: (theme) => 
          theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900]
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 8
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ 
              mb: 4, 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            FreelanceGest
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 4 },
              width: '100%',
              borderRadius: 2
            }}
          >
            <Outlet />
          </Paper>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              © {new Date().getFullYear()} FreelanceGest. Todos los derechos reservados.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
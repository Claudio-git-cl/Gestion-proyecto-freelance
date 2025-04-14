import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  InputAdornment, 
  Alert,
  CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';
import authService from '../../services/authService';

const ForgotPasswordForm = () => {
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Manejar cambio en el campo de email
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };
  
  // Validar formulario
  const validateForm = () => {
    if (!email) {
      setError('El email es obligatorio');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('El formato del email no es válido');
      return false;
    }
    return true;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Llamar al servicio de recuperación de contraseña
      await authService.requestPasswordReset({ email });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al procesar la solicitud');
      console.error('Error al solicitar recuperación de contraseña:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Recuperar Contraseña
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Se ha enviado un correo con instrucciones para restablecer tu contraseña.
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">
                Volver al inicio de sesión
              </Button>
            </Link>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ingresa tu dirección de correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
            error={!!error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar instrucciones'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Volver al inicio de sesión
              </Typography>
            </Link>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ForgotPasswordForm;
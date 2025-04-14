import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { updateProfile, updatePassword } from '../redux/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Datos del perfil
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    avatar: ''
  });
  
  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Errores de validación
  const [validationErrors, setValidationErrors] = useState({});
  
  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);
  
  // Manejar cambios en los campos del perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambios en los campos de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validar formulario de perfil
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    
    if (!profileData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'El email no es válido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validar formulario de contraseña
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Guardar cambios del perfil
  const handleSaveProfile = () => {
    if (validateProfileForm()) {
      dispatch(updateProfile(profileData))
        .unwrap()
        .then(() => {
          setEditMode(false);
          setSnackbar({
            open: true,
            message: 'Perfil actualizado correctamente',
            severity: 'success'
          });
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: error || 'Error al actualizar el perfil',
            severity: 'error'
          });
        });
    }
  };
  
  // Cambiar contraseña
  const handleChangePassword = () => {
    if (validatePasswordForm()) {
      dispatch(updatePassword(passwordData))
        .unwrap()
        .then(() => {
          setPasswordMode(false);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setSnackbar({
            open: true,
            message: 'Contraseña actualizada correctamente',
            severity: 'success'
          });
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: error || 'Error al actualizar la contraseña',
            severity: 'error'
          });
        });
    }
  };
  
  // Manejar cierre del snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Manejar cambio de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Perfil
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profileData.avatar || '/static/images/avatar/default.jpg'}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }}
              />
              {editMode && (
                <IconButton
                  color="primary"
                  aria-label="cambiar avatar"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    bgcolor: 'background.paper'
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Miembro desde
                </Typography>
                <Typography variant="body1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => setPasswordMode(!passwordMode)}
              sx={{ mt: 2 }}
            >
              Cambiar Contraseña
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Información Personal
              </Typography>
              
              {!editMode ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditMode(false);
                      // Restaurar datos originales
                      if (user) {
                        setProfileData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          company: user.company || '',
                          address: user.address || '',
                          avatar: user.avatar || ''
                        });
                      }
                    }}
                    sx={{ mr: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Guardar
                  </Button>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Empresa"
                  name="company"
                  value={profileData.company}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            {passwordMode && (
              <>
                <Box sx={{ mt: 4, mb: 2 }}>
                  <Typography variant="h5">
                    Cambiar Contraseña
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 3 }} />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña Actual"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      error={!!validationErrors.currentPassword}
                      helperText={validationErrors.currentPassword}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nueva Contraseña"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={!!validationErrors.newPassword}
                      helperText={validationErrors.newPassword}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Nueva Contraseña"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={!!validationErrors.confirmPassword}
                      helperText={validationErrors.confirmPassword}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        onClick={() => {
                          setPasswordMode(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setValidationErrors({});
                        }}
                        sx={{ mr: 1 }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={loading}
                      >
                        Actualizar Contraseña
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
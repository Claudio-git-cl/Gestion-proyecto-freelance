import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    bio: '',
    website: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
        address: user.address || '',
        bio: user.bio || '',
        website: user.website || ''
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Create form data for file upload
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });
      
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Perfil actualizado correctamente');
      setLoading(false);
    } catch (err) {
      setError('Error al actualizar el perfil: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
        address: user.address || '',
        bio: user.bio || '',
        website: user.website || ''
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      } else {
        setAvatarPreview('');
      }
    }
    
    setAvatar(null);
    setIsEditing(false);
  };
  
  if (!user) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mi Perfil
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Avatar Section */}
              <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview}
                    alt={profileData.name}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  {isEditing && (
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: -10,
                        backgroundColor: 'background.paper'
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
              </Grid>
              
              {/* Edit/Save Buttons */}
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      variant="outlined"
                      color="error"
                    >
                      Cancelar
                    </Button>
                    <Button
                      startIcon={<SaveIcon />}
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                    </Button>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
              </Grid>
              
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sitio Web"
                  name="website"
                  value={profileData.website}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Información Profesional
                </Typography>
              </Grid>
              
              {/* Professional Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Empresa"
                  name="company"
                  value={profileData.company}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  name="position"
                  value={profileData.position}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biografía"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
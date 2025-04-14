import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { userService } from '../services/api';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'es',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectReminders: true,
    invoiceReminders: true,
    paymentNotifications: true
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    fontSize: 'medium'
  });
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await userService.getSettings();
      
      // Update state with fetched settings
      if (data.general) setGeneralSettings(data.general);
      if (data.notifications) setNotificationSettings(data.notifications);
      if (data.appearance) setAppearanceSettings(data.appearance);
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar la configuración');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveGeneralSettings = async () => {
    try {
      setLoading(true);
      setError('');
      await userService.updateSettings({ general: generalSettings });
      setSuccess('Configuración general actualizada correctamente');
      setLoading(false);
    } catch (err) {
      setError('Error al guardar la configuración general');
      setLoading(false);
    }
  };
  
  const saveSecuritySettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate passwords
      if (securitySettings.newPassword !== securitySettings.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      
      await userService.changePassword(securitySettings);
      setSuccess('Contraseña actualizada correctamente');
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (err) {
      setError('Error al cambiar la contraseña: ' + (err.message || 'Inténtalo de nuevo'));
      setLoading(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      setError('');
      await userService.updateSettings({ notifications: notificationSettings });
      setSuccess('Configuración de notificaciones actualizada correctamente');
      setLoading(false);
    } catch (err) {
      setError('Error al guardar la configuración de notificaciones');
      setLoading(false);
    }
  };
  
  const saveAppearanceSettings = async () => {
    try {
      setLoading(true);
      setError('');
      await userService.updateSettings({ appearance: appearanceSettings });
      setSuccess('Configuración de apariencia actualizada correctamente');
      setLoading(false);
    } catch (err) {
      setError('Error al guardar la configuración de apariencia');
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración
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
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab icon={<LanguageIcon />} label="General" />
            <Tab icon={<SecurityIcon />} label="Seguridad" />
            <Tab icon={<NotificationsIcon />} label="Notificaciones" />
            <Tab icon={<PaletteIcon />} label="Apariencia" />
          </Tabs>
          
          {/* General Settings */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="language-label">Idioma</InputLabel>
                  <Select
                    labelId="language-label"
                    name="language"
                    value={generalSettings.language}
                    onChange={handleGeneralChange}
                    label="Idioma"
                  >
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="currency-label">Moneda</InputLabel>
                  <Select
                    labelId="currency-label"
                    name="currency"
                    value={generalSettings.currency}
                    onChange={handleGeneralChange}
                    label="Moneda"
                  >
                    <MenuItem value="USD">USD - Dólar estadounidense</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - Libra esterlina</MenuItem>
                    <MenuItem value="MXN">MXN - Peso mexicano</MenuItem>
                    <MenuItem value="ARS">ARS - Peso argentino</MenuItem>
                    <MenuItem value="CLP">CLP - Peso chileno</MenuItem>
                    <MenuItem value="COP">COP - Peso colombiano</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="date-format-label">Formato de Fecha</InputLabel>
                  <Select
                    labelId="date-format-label"
                    name="dateFormat"
                    value={generalSettings.dateFormat}
                    onChange={handleGeneralChange}
                    label="Formato de Fecha"
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="time-format-label">Formato de Hora</InputLabel>
                  <Select
                    labelId="time-format-label"
                    name="timeFormat"
                    value={generalSettings.timeFormat}
                    onChange={handleGeneralChange}
                    label="Formato de Hora"
                  >
                    <MenuItem value="12h">12 horas (AM/PM)</MenuItem>
                    <MenuItem value="24h">24 horas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveGeneralSettings}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Security Settings */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Cambiar Contraseña
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña Actual"
                  name="currentPassword"
                  type="password"
                  value={securitySettings.currentPassword}
                  onChange={handleSecurityChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  name="newPassword"
                  type="password"
                  value={securitySettings.newPassword}
                  onChange={handleSecurityChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  name="confirmPassword"
                  type="password"
                  value={securitySettings.confirmPassword}
                  onChange={handleSecurityChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveSecuritySettings}
                  disabled={loading || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                >
                  {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Notification Settings */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Recibir notificaciones por email"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.projectReminders}
                      onChange={handleNotificationChange}
                      name="projectReminders"
                      color="primary"
                    />
                  }
                  label="Recordatorios de proyectos"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.invoiceReminders}
                      onChange={handleNotificationChange}
                      name="invoiceReminders"
                      color="primary"
                    />
                  }
                  label="Recordatorios de facturas"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.paymentNotifications}
                      onChange={handleNotificationChange}
                      name="paymentNotifications"
                      color="primary"
                    />
                  }
                  label="Notificaciones de pagos"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveNotificationSettings}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Appearance Settings */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="theme-label">Tema</InputLabel>
                  <Select
                    labelId="theme-label"
                    name="theme"
                    value={appearanceSettings.theme}
                    onChange={handleAppearanceChange}
                    label="Tema"
                  >
                    <MenuItem value="light">Claro</MenuItem>
                    <MenuItem value="dark">Oscuro</MenuItem>
                    <MenuItem value="system">Sistema</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="primary-color-label">Color Principal</InputLabel>
                  <Select
                    labelId="primary-color-label"
                    name="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={handleAppearanceChange}
                    label="Color Principal"
                  >
                    <MenuItem value="blue">Azul</MenuItem>
                    <MenuItem value="purple">Púrpura</MenuItem>
                    <MenuItem value="green">Verde</MenuItem>
                    <MenuItem value="orange">Naranja</MenuItem>
                    <MenuItem value="red">Rojo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="font-size-label">Tamaño de Fuente</InputLabel>
                  <Select
                    labelId="font-size-label"
                    name="fontSize"
                    value={appearanceSettings.fontSize}
                    onChange={handleAppearanceChange}
                    label="Tamaño de Fuente"
                  >
                    <MenuItem value="small">Pequeño</MenuItem>
                    <MenuItem value="medium">Mediano</MenuItem>
                    <MenuItem value="large">Grande</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveAppearanceSettings}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
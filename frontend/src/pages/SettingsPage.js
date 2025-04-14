import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Backup as BackupIcon,
  CloudDownload as RestoreIcon
} from '@mui/icons-material';
import { setDarkMode } from '../redux/slices/themeSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.theme);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('EUR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Manejar cambio de tema
  const handleThemeChange = (event) => {
    dispatch(setDarkMode(event.target.checked));
  };
  
  // Manejar cambio de notificaciones
  const handleNotificationsChange = (event) => {
    setNotificationsEnabled(event.target.checked);
  };
  
  // Manejar cambio de notificaciones por email
  const handleEmailNotificationsChange = (event) => {
    setEmailNotifications(event.target.checked);
  };
  
  // Manejar cambio de idioma
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };
  
  // Manejar cambio de moneda
  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };
  
  // Manejar cambio de formato de fecha
  const handleDateFormatChange = (event) => {
    setDateFormat(event.target.value);
  };
  
  // Guardar configuración
  const handleSaveSettings = () => {
    // Aquí se implementaría la lógica para guardar la configuración
    setSnackbar({
      open: true,
      message: 'Configuración guardada correctamente',
      severity: 'success'
    });
  };
  
  // Exportar datos
  const handleExportData = () => {
    // Aquí se implementaría la lógica para exportar los datos
    setSnackbar({
      open: true,
      message: 'Datos exportados correctamente',
      severity: 'success'
    });
  };
  
  // Importar datos
  const handleImportData = () => {
    // Aquí se implementaría la lógica para importar los datos
    setSnackbar({
      open: true,
      message: 'Datos importados correctamente',
      severity: 'success'
    });
  };
  
  // Manejar cierre del snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DarkModeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Apariencia</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={handleThemeChange}
                  color="primary"
                />
              }
              label="Modo Oscuro"
            />
            
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="theme-color-label">Color del Tema</InputLabel>
                <Select
                  labelId="theme-color-label"
                  value="blue"
                  label="Color del Tema"
                >
                  <MenuItem value="blue">Azul</MenuItem>
                  <MenuItem value="purple">Púrpura</MenuItem>
                  <MenuItem value="green">Verde</MenuItem>
                  <MenuItem value="orange">Naranja</MenuItem>
                  <MenuItem value="red">Rojo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Notificaciones</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={handleNotificationsChange}
                  color="primary"
                />
              }
              label="Activar notificaciones"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={handleEmailNotificationsChange}
                  color="primary"
                  disabled={!notificationsEnabled}
                />
              }
              label="Recibir notificaciones por email"
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Notificarme cuando:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText primary="Se crea un nuevo proyecto" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={true}
                    disabled={!notificationsEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Se acerca la fecha límite de un proyecto" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={true}
                    disabled={!notificationsEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Se recibe un pago" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={true}
                    disabled={!notificationsEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Una factura está vencida" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={true}
                    disabled={!notificationsEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Seguridad</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Autenticación de dos factores"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
              >
                Cambiar Contraseña
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<DeleteIcon />}
              >
                Eliminar Cuenta
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Regionalización</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-label">Idioma</InputLabel>
              <Select
                labelId="language-label"
                value={language}
                onChange={handleLanguageChange}
                label="Idioma"
              >
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="it">Italiano</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-label">Moneda</InputLabel>
              <Select
                labelId="currency-label"
                value={currency}
                onChange={handleCurrencyChange}
                label="Moneda"
              >
                <MenuItem value="EUR">Euro (€)</MenuItem>
                <MenuItem value="USD">Dólar estadounidense ($)</MenuItem>
                <MenuItem value="GBP">Libra esterlina (£)</MenuItem>
                <MenuItem value="JPY">Yen japonés (¥)</MenuItem>
                <MenuItem value="CNY">Yuan chino (¥)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="date-format-label">Formato de Fecha</InputLabel>
              <Select
                labelId="date-format-label"
                value={dateFormat}
                onChange={handleDateFormatChange}
                label="Formato de Fecha"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BackupIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Copia de Seguridad y Restauración</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Exporta tus datos para hacer una copia de seguridad o importa datos previamente exportados.
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<BackupIcon />}
              fullWidth
              sx={{ mb: 2 }}
              onClick={handleExportData}
            >
              Exportar Datos
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              fullWidth
              onClick={handleImportData}
            >
              Importar Datos
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SaveIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Guardar Configuración</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Guarda todos los cambios realizados en la configuración.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              fullWidth
              onClick={handleSaveSettings}
            >
              Guardar Configuración
            </Button>
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

export default SettingsPage;
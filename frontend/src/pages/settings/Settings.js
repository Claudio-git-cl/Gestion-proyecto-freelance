import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { currentUser, updateProfile, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      defaultHourlyRate: currentUser?.settings?.defaultHourlyRate || '',
      currency: currentUser?.settings?.currency || 'CLP',
      language: currentUser?.settings?.language || 'es'
    },
    validationSchema: Yup.object({
      defaultHourlyRate: Yup.number()
        .positive('La tarifa debe ser un número positivo')
        .required('La tarifa por hora es obligatoria'),
      currency: Yup.string().required('La moneda es obligatoria'),
      language: Yup.string().required('El idioma es obligatorio')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccess(false);
      
      const userData = {
        settings: {
          defaultHourlyRate: values.defaultHourlyRate,
          currency: values.currency,
          language: values.language
        }
      };
      
      const success = await updateProfile(userData);
      setLoading(false);
      
      if (success) {
        setSuccess(true);
      }
    }
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Configuración actualizada correctamente
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configuración general
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="defaultHourlyRate"
                name="defaultHourlyRate"
                label="Tarifa por hora predeterminada"
                variant="outlined"
                type="number"
                value={formik.values.defaultHourlyRate}
                onChange={formik.handleChange}
                error={formik.touched.defaultHourlyRate && Boolean(formik.errors.defaultHourlyRate)}
                helperText={formik.touched.defaultHourlyRate && formik.errors.defaultHourlyRate}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="currency-label">Moneda</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency"
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  label="Moneda"
                  error={formik.touched.currency && Boolean(formik.errors.currency)}
                >
                  <MenuItem value="CLP">Peso Chileno (CLP)</MenuItem>
                  <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                  <MenuItem value="MXN">Peso Mexicano (MXN)</MenuItem>
                  <MenuItem value="COP">Peso Colombiano (COP)</MenuItem>
                  <MenuItem value="PEN">Sol Peruano (PEN)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="language-label">Idioma</InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  name="language"
                  value={formik.values.language}
                  onChange={formik.handleChange}
                  label="Idioma"
                  error={formik.touched.language && Boolean(formik.errors.language)}
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">Inglés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Configuración de facturación
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="invoicePrefix"
                name="invoicePrefix"
                label="Prefijo de factura"
                variant="outlined"
                value={formik.values.invoicePrefix || 'FACT-'}
                onChange={formik.handleChange}
                error={formik.touched.invoicePrefix && Boolean(formik.errors.invoicePrefix)}
                helperText={formik.touched.invoicePrefix && formik.errors.invoicePrefix}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="taxRate"
                name="taxRate"
                label="Tasa de impuesto (%)"
                variant="outlined"
                type="number"
                value={formik.values.taxRate || 19}
                onChange={formik.handleChange}
                error={formik.touched.taxRate && Boolean(formik.errors.taxRate)}
                helperText={formik.touched.taxRate && formik.errors.taxRate}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar cambios'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings;
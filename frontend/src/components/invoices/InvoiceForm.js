import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Simulación de datos para desarrollo
const mockClients = [
  { id: 1, name: 'Juan Pérez', company: 'Empresa A' },
  { id: 2, name: 'María López', company: 'Empresa B' },
  { id: 3, name: 'Carlos Rodríguez', company: 'Empresa C' },
];

const mockProjects = [
  { id: 1, name: 'Diseño de sitio web', clientId: 1 },
  { id: 2, name: 'Desarrollo de aplicación móvil', clientId: 2 },
  { id: 3, name: 'Mantenimiento de plataforma', clientId: 3 },
];

const validationSchema = Yup.object({
  clientId: Yup.number().required('El cliente es obligatorio'),
  projectId: Yup.number().required('El proyecto es obligatorio'),
  invoiceDate: Yup.date().required('La fecha de factura es obligatoria'),
  dueDate: Yup.date().min(
    Yup.ref('invoiceDate'),
    'La fecha de vencimiento debe ser posterior a la fecha de factura'
  ).required('La fecha de vencimiento es obligatoria'),
  status: Yup.string().required('El estado es obligatorio'),
  items: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('La descripción es obligatoria'),
      quantity: Yup.number().positive('La cantidad debe ser positiva').required('La cantidad es obligatoria'),
      unitPrice: Yup.number().positive('El precio unitario debe ser positivo').required('El precio unitario es obligatorio')
    })
  ).min(1, 'Debe agregar al menos un ítem')
});

const InvoiceForm = ({ invoice, onSubmit, onCancel }) => {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    // En un entorno real, aquí llamaríamos a los servicios
    // getClients().then(data => setClients(data));
    // getProjects().then(data => setProjects(data));
    setClients(mockClients);
    setProjects(mockProjects);
  }, []);

  const formik = useFormik({
    initialValues: {
      invoiceNumber: invoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      clientId: invoice?.clientId || '',
      projectId: invoice?.projectId || '',
      invoiceDate: invoice?.invoiceDate || new Date(),
      dueDate: invoice?.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)),
      status: invoice?.status || 'pending',
      items: invoice?.items || [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: invoice?.notes || ''
    },
    validationSchema,
    onSubmit: (values) => {
      // Calcular el total
      const total = values.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      onSubmit({ ...values, total });
    }
  });

  useEffect(() => {
    if (formik.values.clientId) {
      setFilteredProjects(projects.filter(project => project.clientId === formik.values.clientId));
      // Si el proyecto seleccionado no pertenece al cliente, resetear
      if (formik.values.projectId && !projects.find(p => p.id === formik.values.projectId && p.clientId === formik.values.clientId)) {
        formik.setFieldValue('projectId', '');
      }
    } else {
      setFilteredProjects([]);
    }
  }, [formik.values.clientId, projects]);

  const handleAddItem = () => {
    formik.setFieldValue('items', [...formik.values.items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formik.values.items];
    newItems.splice(index, 1);
    formik.setFieldValue('items', newItems);
  };

  const calculateSubtotal = (item) => {
    return item.quantity * item.unitPrice;
  };

  const calculateTotal = () => {
    return formik.values.items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagada' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {invoice ? 'Editar Factura' : 'Nueva Factura'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="invoiceNumber"
              name="invoiceNumber"
              label="Número de factura"
              value={formik.values.invoiceNumber}
              onChange={formik.handleChange}
              variant="outlined"
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.clientId && Boolean(formik.errors.clientId)}
            >
              <InputLabel id="client-label">Cliente</InputLabel>
              <Select
                labelId="client-label"
                id="clientId"
                name="clientId"
                value={formik.values.clientId}
                onChange={formik.handleChange}
                label="Cliente"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.clientId && formik.errors.clientId && (
                <FormHelperText>{formik.errors.clientId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.projectId && Boolean(formik.errors.projectId)}
              disabled={!formik.values.clientId}
            >
              <InputLabel id="project-label">Proyecto</InputLabel>
              <Select
                labelId="project-label"
                id="projectId"
                name="projectId"
                value={formik.values.projectId}
                onChange={formik.handleChange}
                label="Proyecto"
              >
                {filteredProjects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.projectId && formik.errors.projectId && (
                <FormHelperText>{formik.errors.projectId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                label="Estado"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText>{formik.errors.status}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de factura"
              value={formik.values.invoiceDate}
              onChange={(date) => formik.setFieldValue('invoiceDate', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={formik.touched.invoiceDate && Boolean(formik.errors.invoiceDate)}
                  helperText={formik.touched.invoiceDate && formik.errors.invoiceDate}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de vencimiento"
              value={formik.values.dueDate}
              onChange={(date) => formik.setFieldValue('dueDate', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                  helperText={formik.touched.dueDate && formik.errors.dueDate}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Ítems</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddItem}
                variant="outlined"
              >
                Agregar ítem
              </Button>
            </Box>
            
            {formik.touched.items && formik.errors.items && typeof formik.errors.items === 'string' && (
              <FormHelperText error>{formik.errors.items}</FormHelperText>
            )}
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          name={`items[${index}].description`}
                          value={item.description}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.items?.[index]?.description && 
                            Boolean(formik.errors.items?.[index]?.description)
                          }
                          helperText={
                            formik.touched.items?.[index]?.description && 
                            formik.errors.items?.[index]?.description
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          name={`items[${index}].quantity`}
                          value={item.quantity}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.items?.[index]?.quantity && 
                            Boolean(formik.errors.items?.[index]?.quantity)
                          }
                          helperText={
                            formik.touched.items?.[index]?.quantity && 
                            formik.errors.items?.[index]?.quantity
                          }
                          variant="outlined"
                          size="small"
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          name={`items[${index}].unitPrice`}
                          value={item.unitPrice}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.items?.[index]?.unitPrice && 
                            Boolean(formik.errors.items?.[index]?.unitPrice)
                          }
                          helperText={
                            formik.touched.items?.[index]?.unitPrice && 
                            formik.errors.items?.[index]?.unitPrice
                          }
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                          sx={{ width: '150px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(calculateSubtotal(item))}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(index)}
                          disabled={formik.values.items.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(calculateTotal())}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Notas"
              value={formik.values.notes}
              onChange={formik.handleChange}
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancelar
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {invoice ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default InvoiceForm;
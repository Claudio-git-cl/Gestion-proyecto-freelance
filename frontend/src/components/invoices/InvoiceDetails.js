import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { Download, Send, Print } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvoiceDetails = ({ invoice, onClose, onDownload, onSend }) => {
  if (!invoice) return null;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Factura #{invoice.number}
          </Typography>
          <Chip
            label={invoice.status}
            color={
              invoice.status === 'Pagada' ? 'success' :
              invoice.status === 'Pendiente' ? 'warning' : 'default'
            }
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              De:
            </Typography>
            <Typography variant="body1">
              {invoice.freelancer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.freelancer.email}
            </Typography>
            {invoice.freelancer.phone && (
              <Typography variant="body2" color="text.secondary">
                {invoice.freelancer.phone}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Para:
            </Typography>
            <Typography variant="body1">
              {invoice.client.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.client.email}
            </Typography>
            {invoice.client.phone && (
              <Typography variant="body2" color="text.secondary">
                {invoice.client.phone}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Detalles de la factura:
            </Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120 }}>
                Número:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.number}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120 }}>
                Fecha de emisión:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: es })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 120 }}>
                Fecha de vencimiento:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: es })}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Proyecto:
            </Typography>
            <Typography variant="body1">
              {invoice.project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Período: {format(new Date(invoice.startDate), 'dd/MM/yyyy', { locale: es })} - {format(new Date(invoice.endDate), 'dd/MM/yyyy', { locale: es })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detalle de ítems
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unitario</TableCell>
                <TableCell align="right">Importe</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                  Subtotal:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${invoice.subtotal.toFixed(2)}
                </TableCell>
              </TableRow>
              {invoice.tax > 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    Impuestos ({invoice.taxRate}%):
                  </TableCell>
                  <TableCell align="right">
                    ${invoice.tax.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                  Total:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  ${invoice.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {invoice.notes && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notas
          </Typography>
          <Typography variant="body2">
            {invoice.notes}
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => onDownload(invoice.id)}
        >
          Descargar PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<Send />}
          onClick={() => onSend(invoice.id)}
        >
          Enviar
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceDetails;
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    marginBottom: 2,
  },
  invoiceDueDate: {
    fontSize: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientInfo: {
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    padding: 5,
  },
  descriptionCell: {
    width: '50%',
  },
  quantityCell: {
    width: '15%',
    textAlign: 'right',
  },
  priceCell: {
    width: '15%',
    textAlign: 'right',
  },
  totalCell: {
    width: '20%',
    textAlign: 'right',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryTable: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontWeight: 'bold',
    paddingTop: 5,
    marginTop: 5,
  },
  notes: {
    marginTop: 20,
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  status: {
    position: 'absolute',
    top: 80,
    right: 30,
    transform: 'rotate(-30deg)',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
    opacity: 0.7,
  },
});

const InvoicePDF = ({ invoice, client, project, companyInfo }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'PAGADA';
      case 'pending':
        return 'PENDIENTE';
      case 'overdue':
        return 'VENCIDA';
      case 'draft':
        return 'BORRADOR';
      case 'cancelled':
        return 'CANCELADA';
      default:
        return '';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'overdue':
        return '#f44336';
      case 'draft':
        return '#9e9e9e';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Marca de agua del estado */}
        <Text style={[styles.status, { color: getStatusColor(invoice.status) }]}>
          {getStatusText(invoice.status)}
        </Text>
        
        {/* Cabecera */}
        <View style={styles.header}>
          <View>
            {companyInfo.logo ? (
              <Image style={styles.logo} src={companyInfo.logo} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{companyInfo.name}</Text>
            )}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>
              {invoice.number || `#${invoice.id.substring(0, 8)}`}
            </Text>
            <Text style={styles.invoiceDate}>
              Fecha: {invoice.date ? format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es }) : '-'}
            </Text>
            <Text style={styles.invoiceDueDate}>
              Vencimiento: {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: es }) : '-'}
            </Text>
          </View>
        </View>
        
        {/* Información de la empresa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DE</Text>
          <Text>{companyInfo.name}</Text>
          <Text>{companyInfo.address}</Text>
          <Text>{companyInfo.postalCode}, {companyInfo.city}</Text>
          <Text>{companyInfo.country}</Text>
          <Text>NIF/CIF: {companyInfo.taxId}</Text>
          <Text>Email: {companyInfo.email}</Text>
          <Text>Teléfono: {companyInfo.phone}</Text>
        </View>
        
        {/* Información del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARA</Text>
          {client ? (
            <>
              <Text>{client.name}</Text>
              {client.contactName && <Text>{client.contactName}</Text>}
              {client.address && <Text>{client.address}</Text>}
              {client.postalCode && client.city && (
                <Text>{client.postalCode}, {client.city}</Text>
              )}
              {client.country && <Text>{client.country}</Text>}
              {client.taxId && <Text>NIF/CIF: {client.taxId}</Text>}
              {client.email && <Text>Email: {client.email}</Text>}
              {client.phone && <Text>Teléfono: {client.phone}</Text>}
            </>
          ) : (
            <Text>Cliente no disponible</Text>
          )}
        </View>
        
        {/* Proyecto */}
        {project && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROYECTO</Text>
            <Text>{project.name}</Text>
            {project.description && <Text>{project.description}</Text>}
          </View>
        )}
        
        {/* Tabla de conceptos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONCEPTOS</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text>Descripción</Text>
              </View>
              <View style={[styles.tableCell, styles.quantityCell]}>
                <Text>Cantidad</Text>
              </View>
              <View style={[styles.tableCell, styles.priceCell]}>
                <Text>Precio</Text>
              </View>
              <View style={[styles.tableCell, styles.totalCell]}>
                <Text>Total</Text>
              </View>
            </View>
            
            {invoice.items && invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text>{item.description}</Text>
                </View>
                <View style={[styles.tableCell, styles.quantityCell]}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={[styles.tableCell, styles.priceCell]}>
                  <Text>€{item.price.toFixed(2)}</Text>
                </View>
                <View style={[styles.tableCell, styles.totalCell]}>
                  <Text>€{(item.quantity * item.price).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Resumen */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text>Subtotal:</Text>
                <Text>€{invoice.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>IVA ({invoice.taxRate}%):</Text>
                <Text>€{invoice.taxAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text>Total:</Text>
                <Text>€{invoice.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Notas */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>NOTAS</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
        
        {/* Información de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DE PAGO</Text>
          <Text>Por favor, realice el pago a la siguiente cuenta bancaria:</Text>
          <Text>Banco: {companyInfo.bankName}</Text>
          <Text>IBAN: {companyInfo.iban}</Text>
          <Text>BIC/SWIFT: {companyInfo.bic}</Text>
          <Text>Referencia: {invoice.number || `#${invoice.id.substring(0, 8)}`}</Text>
        </View>
        
        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>
            {companyInfo.name} - {companyInfo.address}, {companyInfo.postalCode} {companyInfo.city}, {companyInfo.country}
          </Text>
          <Text>
            NIF/CIF: {companyInfo.taxId} - Email: {companyInfo.email} - Teléfono: {companyInfo.phone}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
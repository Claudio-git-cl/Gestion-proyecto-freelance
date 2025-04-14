import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from '../utils/formatters';

export const downloadInvoicePdf = (invoice, client) => {
  if (!invoice) {
    throw new Error('No se proporcionó información de la factura');
  }

  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  
  // Configuración de fuentes y colores
  const primaryColor = [41, 121, 255]; // Color azul primario
  
  // Añadir logo y encabezado
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FACTURA', 105, 20, { align: 'center' });
  
  // Información de la empresa
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Tu Empresa, S.L.', 20, 30);
  doc.text('CIF: B12345678', 20, 35);
  doc.text('Calle Ejemplo, 123', 20, 40);
  doc.text('28001 Madrid', 20, 45);
  doc.text('info@tuempresa.com', 20, 50);
  doc.text('Tel: +34 912 345 678', 20, 55);
  
  // Información de la factura
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Detalles de la Factura:', 140, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Número: ${invoice.number}`, 140, 35);
  doc.text(`Fecha: ${formatDate(invoice.date)}`, 140, 40);
  doc.text(`Vencimiento: ${formatDate(invoice.dueDate)}`, 140, 45);
  
  // Estado de la factura
  doc.setFontSize(10);
  let statusColor;
  switch (invoice.status) {
    case 'Pagada':
      statusColor = [46, 125, 50]; // Verde
      break;
    case 'Pendiente':
      statusColor = [237, 108, 2]; // Naranja
      break;
    case 'Vencida':
      statusColor = [211, 47, 47]; // Rojo
      break;
    default:
      statusColor = [0, 0, 0]; // Negro
  }
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Estado: ${invoice.status}`, 140, 50);
  doc.setTextColor(0, 0, 0);
  
  // Información del cliente
  if (client) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Cliente:', 20, 70);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(client.name, 20, 75);
    if (client.address) doc.text(client.address, 20, 80);
    doc.text(`Email: ${client.email}`, 20, 85);
    if (client.phone) doc.text(`Tel: ${client.phone}`, 20, 90);
  } else {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Cliente:', 20, 70);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.clientName || 'Cliente no especificado', 20, 75);
  }
  
  // Tabla de ítems
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Detalle de Servicios:', 20, 105);
  
  const tableColumn = ["Descripción", "Cantidad", "Precio Unitario", "Importe"];
  const tableRows = [];
  
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach(item => {
      const itemData = [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.amount)
      ];
      tableRows.push(itemData);
    });
  }
  
  doc.autoTable({
    startY: 110,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 121, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 5,
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Resumen de la factura
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(invoice.subtotal), 170, finalY, { align: 'right' });
  
  doc.text(`IVA (${invoice.taxRate}%):`, 130, finalY + 5);
  doc.text(formatCurrency(invoice.taxAmount), 170, finalY + 5, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total:', 130, finalY + 15);
  doc.text(formatCurrency(invoice.total), 170, finalY + 15, { align: 'right' });
  doc.setFont(undefined, 'normal');
  
  // Notas
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.text('Notas:', 20, finalY + 30);
    doc.text(invoice.notes, 20, finalY + 35);
  }
  
  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Gracias por su confianza. Esta factura sirve como comprobante de pago.',
      105,
      doc.internal.pageSize.height - 30,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 20,
      { align: 'center' }
    );
  }
  
  // Guardar el PDF
  doc.save(`Factura_${invoice.number}.pdf`);
};
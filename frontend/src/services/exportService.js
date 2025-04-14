import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para exportar a PDF
export const exportToPDF = (data, columns, title, filename) => {
  const doc = new jsPDF();
  
  // Añadir título
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  
  // Añadir fecha
  doc.text(
    `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
    14, 30
  );
  
  // Preparar datos para la tabla
  const tableColumn = columns.map(col => col.header);
  const tableRows = data.map(item => {
    return columns.map(col => {
      if (typeof col.accessor === 'function') {
        return col.accessor(item);
      }
      return item[col.accessor];
    });
  });
  
  // Generar tabla
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [78, 78, 78]
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Guardar PDF
  doc.save(`${filename}.pdf`);
};

// Función para exportar a Excel
export const exportToExcel = (data, columns, title, filename) => {
  // Preparar datos para Excel
  const excelData = data.map(item => {
    const row = {};
    columns.forEach(col => {
      if (typeof col.accessor === 'function') {
        row[col.header] = col.accessor(item);
      } else {
        row[col.header] = item[col.accessor];
      }
    });
    return row;
  });
  
  // Crear libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Añadir hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  
  // Guardar archivo
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Función para exportar facturas a PDF
export const exportInvoiceToPDF = (invoice, company) => {
  const doc = new jsPDF();
  
  // Configuración de la página
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;
  
  // Añadir logo y datos de la empresa
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(company.address, 14, yPos);
  
  yPos += 5;
  doc.text(`${company.postalCode}, ${company.city}`, 14, yPos);
  
  yPos += 5;
  doc.text(`CIF/NIF: ${company.taxId}`, 14, yPos);
  
  yPos += 5;
  doc.text(`Tel: ${company.phone}`, 14, yPos);
  
  yPos += 5;
  doc.text(`Email: ${company.email}`, 14, yPos);
  
  // Información de la factura
  yPos = 40;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Factura Nº: ${invoice.number}`, pageWidth - 14, yPos, { align: 'right' });
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es })}`, pageWidth - 14, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text(`Vencimiento: ${format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: es })}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Información del cliente
  yPos = 70;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.name, 14, yPos);
  
  yPos += 7;
  if (invoice.client.company) {
    doc.text(invoice.client.company, 14, yPos);
    yPos += 7;
  }
  
  if (invoice.client.address) {
    doc.text(invoice.client.address, 14, yPos);
    yPos += 7;
  }
  
  if (invoice.client.taxId) {
    doc.text(`CIF/NIF: ${invoice.client.taxId}`, 14, yPos);
    yPos += 7;
  }
  
  // Detalles de la factura
  yPos = 110;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DE LA FACTURA', 14, yPos);
  
  yPos += 10;
  
  // Tabla de conceptos
  const tableColumn = ['Concepto', 'Cantidad', 'Precio', 'Total'];
  const tableRows = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [78, 78, 78]
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    }
  });
  
  // Totales
  yPos = doc.autoTable.previous.finalY + 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', pageWidth - 60, yPos);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Impuestos
  yPos += 7;
  doc.text(`IVA (${invoice.taxRate}%):`, pageWidth - 60, yPos);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Total
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 60, yPos);
  doc.text(`$${invoice.amount.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Notas
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Notas:', 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'italic');
  const splitNotes = doc.splitTextToSize(invoice.notes || 'Gracias por su confianza.', pageWidth - 28);
  doc.text(splitNotes, 14, yPos);
  
  // Condiciones de pago
  yPos += splitNotes.length * 7 + 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Condiciones de pago:', 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'italic');
  doc.text(invoice.paymentTerms || 'Pago a 30 días desde la fecha de emisión.', 14, yPos);
  
  // Guardar PDF
  doc.save(`Factura_${invoice.number}.pdf`);
};

// Función para exportar informe de tiempo a Excel
export const exportTimeReportToExcel = (timeEntries, projects, dateRange) => {
  // Agrupar por proyecto
  const projectGroups = {};
  
  timeEntries.forEach(entry => {
    if (!projectGroups[entry.project.id]) {
      projectGroups[entry.project.id] = {
        projectName: entry.project.title,
        entries: [],
        totalHours: 0
      };
    }
    
    const hours = entry.duration / 3600; // Convertir segundos a horas
    projectGroups[entry.project.id].entries.push({
      date: format(new Date(entry.date), 'dd/MM/yyyy', { locale: es }),
      description: entry.description,
      hours: hours.toFixed(2)
    });
    
    projectGroups[entry.project.id].totalHours += hours;
  });
  
  // Crear hojas para cada proyecto
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen
  const summaryData = Object.values(projectGroups).map(group => ({
    'Proyecto': group.projectName,
    'Total Horas': group.totalHours.toFixed(2),
    'Porcentaje': `${((group.totalHours / Object.values(projectGroups).reduce((sum, g) => sum + g.totalHours, 0)) * 100).toFixed(2)}%`
  }));
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  
  // Hojas individuales por proyecto
  Object.values(projectGroups).forEach(group => {
    const sheet = XLSX.utils.json_to_sheet(group.entries);
    XLSX.utils.book_append_sheet(workbook, sheet, group.projectName.substring(0, 30)); // Limitar longitud del nombre
  });
  
  // Nombre del archivo
  const fromDate = format(dateRange.from, 'yyyyMMdd', { locale: es });
  const toDate = format(dateRange.to, 'yyyyMMdd', { locale: es });
  const filename = `Reporte_Tiempo_${fromDate}_${toDate}.xlsx`;
  
  // Guardar archivo
  XLSX.writeFile(workbook, filename);
};
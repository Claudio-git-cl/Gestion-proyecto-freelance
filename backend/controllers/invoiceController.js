const Invoice = require('../models/Invoice');
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const Client = require('../models/Client');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Generar un número de factura único
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Obtener el conteo de facturas para este mes
  const count = await Invoice.countDocuments({
    date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), 1),
      $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
    }
  });
  
  // Formato: FAC-YY-MM-XXXX (ej., FAC-23-05-0001)
  return `FAC-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
};

// Obtener todas las facturas
exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user.id })
      .sort({ date: -1 })
      .populate('client', 'name')
      .populate('project', 'name');
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: 'Error al obtener las facturas' });
  }
};

// Obtener factura por ID
exports.getById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    })
      .populate('client', 'name email phone address')
      .populate('project', 'name')
      .populate('timeEntries');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ message: 'Error al obtener la factura' });
  }
};

// Obtener facturas por proyecto
exports.getByProject = async (req, res) => {
  try {
    const invoices = await Invoice.find({ 
      project: req.params.projectId,
      createdBy: req.user.id
    })
      .sort({ date: -1 })
      .populate('client', 'name');
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error al obtener facturas por proyecto:', error);
    res.status(500).json({ message: 'Error al obtener las facturas del proyecto' });
  }
};

// Obtener facturas por cliente
exports.getByClient = async (req, res) => {
  try {
    const invoices = await Invoice.find({ 
      client: req.params.clientId,
      createdBy: req.user.id
    })
      .sort({ date: -1 })
      .populate('project', 'name');
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error al obtener facturas por cliente:', error);
    res.status(500).json({ message: 'Error al obtener las facturas del cliente' });
  }
};

// Crear una nueva factura
exports.create = async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Generar número de factura si no se proporciona
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await generateInvoiceNumber();
    }
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    // Actualizar registros de tiempo para marcarlos como facturados
    if (invoice.timeEntries && invoice.timeEntries.length > 0) {
      await TimeEntry.updateMany(
        { _id: { $in: invoice.timeEntries } },
        { $set: { invoiced: true, invoice: invoice._id } }
      );
    }
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ message: 'Error al crear la factura' });
  }
};

// Actualizar una factura
exports.update = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Si el estado es pagado, no permitir ciertos cambios
    if (invoice.status === 'paid' && req.body.status !== 'paid') {
      return res.status(400).json({ message: 'No se puede cambiar el estado de una factura pagada' });
    }
    
    // Obtener los registros de tiempo antiguos para desmarcarlos
    const oldTimeEntries = invoice.timeEntries || [];
    
    // Actualizar campos de la factura
    Object.keys(req.body).forEach(key => {
      invoice[key] = req.body[key];
    });
    
    await invoice.save();
    
    // Actualizar registros de tiempo
    const newTimeEntries = invoice.timeEntries || [];
    
    // Desmarcar registros de tiempo antiguos que ya no están en la factura
    const entriesToUnmark = oldTimeEntries.filter(
      entry => !newTimeEntries.includes(entry.toString())
    );
    
    if (entriesToUnmark.length > 0) {
      await TimeEntry.updateMany(
        { _id: { $in: entriesToUnmark } },
        { $set: { invoiced: false }, $unset: { invoice: "" } }
      );
    }
    
    // Marcar nuevos registros de tiempo
    if (newTimeEntries.length > 0) {
      await TimeEntry.updateMany(
        { _id: { $in: newTimeEntries } },
        { $set: { invoiced: true, invoice: invoice._id } }
      );
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Error al actualizar la factura' });
  }
};

// Delete an invoice
exports.delete = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Unmark time entries
    if (invoice.timeEntries && invoice.timeEntries.length > 0) {
      await TimeEntry.updateMany(
        { _id: { $in: invoice.timeEntries } },
        { $set: { invoiced: false }, $unset: { invoice: "" } }
      );
    }
    
    await invoice.remove();
    
    res.status(200).json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Error al eliminar la factura' });
  }
};

// Mark invoice as paid
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'La factura ya está marcada como pagada' });
    }
    
    await invoice.markAsPaid(req.body);
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Error al marcar la factura como pagada' });
  }
};

// Generate PDF
exports.generatePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    })
      .populate('client', 'name email phone address')
      .populate('project', 'name')
      .populate('createdBy', 'name email phone');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.invoiceNumber}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    // Header
    doc.fontSize(20).text('FACTURA', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12).text(`Factura #: ${invoice.invoiceNumber}`);
    doc.text(`Fecha: ${new Date(invoice.date).toLocaleDateString()}`);
    doc.text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();
    
    // Client details
    doc.fontSize(14).text('Cliente', { underline: true });
    doc.fontSize(12).text(`Nombre: ${invoice.client.name}`);
    if (invoice.client.address) doc.text(`Dirección: ${invoice.client.address}`);
    if (invoice.client.email) doc.text(`Email: ${invoice.client.email}`);
    if (invoice.client.phone) doc.text(`Teléfono: ${invoice.client.phone}`);
    doc.moveDown();
    
    // Project details
    doc.fontSize(14).text('Proyecto', { underline: true });
    doc.fontSize(12).text(`Nombre: ${invoice.project.name}`);
    doc.moveDown();
    
    // Items table
    doc.fontSize(14).text('Detalle', { underline: true });
    doc.moveDown();
    
    // Table headers
    let y = doc.y;
    doc.fontSize(10).text('Descripción', 50, y);
    doc.text('Cantidad', 300, y, { width: 50, align: 'right' });
    doc.text('Precio', 370, y, { width: 80, align: 'right' });
    doc.text('Importe', 470, y, { width: 80, align: 'right' });
    
    // Draw a line
    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // Table rows
    invoice.items.forEach(item => {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      doc.fontSize(10).text(item.description, 50, y, { width: 240 });
      doc.text(item.quantity.toString(), 300, y, { width: 50, align: 'right' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 370, y, { width: 80, align: 'right' });
      doc.text(`$${item.amount.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
      
      y += 20;
    });
    
    // Draw a line
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // Totals
    doc.fontSize(10).text('Subtotal:', 350, y, { width: 100, align: 'right' });
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    y += 15;
    
    doc.text(`IVA (${invoice.taxRate}%):`, 350, y, { width: 100, align: 'right' });
    doc.text(`$${invoice.taxAmount.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    y += 15;
    
    doc.fontSize(12).text('Total:', 350, y, { width: 100, align: 'right' });
    doc.text(`$${invoice.total.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    
    // Notes
    if (invoice.notes) {
      doc.moveDown(2);
      doc.fontSize(14).text('Notas', { underline: true });
      doc.fontSize(10).text(invoice.notes);
    }
    
    // Payment status
    doc.moveDown(2);
    doc.fontSize(14).text('Estado de pago', { underline: true });
    doc.fontSize(12).text(`Estado: ${invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Vencida'}`);
    
    if (invoice.status === 'paid') {
      doc.text(`Fecha de pago: ${new Date(invoice.paymentDate).toLocaleDateString()}`);
      if (invoice.paymentMethod) {
        const methods = {
          bank_transfer: 'Transferencia bancaria',
          credit_card: 'Tarjeta de crédito',
          cash: 'Efectivo',
          paypal: 'PayPal',
          other: 'Otro'
        };
        doc.text(`Método de pago: ${methods[invoice.paymentMethod] || invoice.paymentMethod}`);
      }
      if (invoice.paymentReference) {
        doc.text(`Referencia de pago: ${invoice.paymentReference}`);
      }
    }
    
    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Add page number
      doc.fontSize(8).text(
        `Página ${i + 1} de ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
      
      // Add footer
      doc.fontSize(8).text(
        `Generado por: ${invoice.createdBy.name} | ${invoice.createdBy.email}`,
        50,
        doc.page.height - 35,
        { align: 'center' }
      );
    }
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error al generar el PDF' });
  }
};

// Send invoice by email
exports.sendByEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    })
      .populate('client', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name email');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Validate email data
    const { to, subject, message } = req.body;
    
    if (!to) {
      return res.status(400).json({ message: 'El destinatario es requerido' });
    }
    
    // Generate PDF
    const pdfPath = path.join(__dirname, '..', 'temp', `factura-${invoice.invoiceNumber}.pdf`);
    const pdfDoc = new PDFDocument({ margin: 50 });
    const pdfStream = fs.createWriteStream(pdfPath);
    
    pdfDoc.pipe(pdfStream);
    
    // Add content to the PDF (same as in generatePdf)
    // Header
    pdfDoc.fontSize(20).text('FACTURA', { align: 'center' });
    pdfDoc.moveDown();
    
    // Invoice details
    pdfDoc.fontSize(12).text(`Factura #: ${invoice.invoiceNumber}`);
    pdfDoc.text(`Fecha: ${new Date(invoice.date).toLocaleDateString()}`);
    pdfDoc.text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    pdfDoc.moveDown();
    
    // Client details
    pdfDoc.fontSize(14).text('Cliente', { underline: true });
    pdfDoc.fontSize(12).text(`Nombre: ${invoice.client.name}`);
    if (invoice.client.address) pdfDoc.text(`Dirección: ${invoice.client.address}`);
    if (invoice.client.email) pdfDoc.text(`Email: ${invoice.client.email}`);
    if (invoice.client.phone) pdfDoc.text(`Teléfono: ${invoice.client.phone}`);
    pdfDoc.moveDown();
    
    // Project details
    pdfDoc.fontSize(14).text('Proyecto', { underline: true });
    pdfDoc.fontSize(12).text(`Nombre: ${invoice.project.name}`);
    pdfDoc.moveDown();
    
    // Items table
    pdfDoc.fontSize(14).text('Detalle', { underline: true });
    pdfDoc.moveDown();
    
    // Table headers
    let y = pdfDoc.y;
    pdfDoc.fontSize(10).text('Descripción', 50, y);
    pdfDoc.text('Cantidad', 300, y, { width: 50, align: 'right' });
    pdfDoc.text('Precio', 370, y, { width: 80, align: 'right' });
    pdfDoc.text('Importe', 470, y, { width: 80, align: 'right' });
    
    // Draw a line
    y += 15;
    pdfDoc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // Table rows
    invoice.items.forEach(item => {
      // Check if we need a new page
      if (y > 700) {
        pdfDoc.addPage();
        y = 50;
      }
      
      pdfDoc.fontSize(10).text(item.description, 50, y, { width: 240 });
      pdfDoc.text(item.quantity.toString(), 300, y, { width: 50, align: 'right' });
      pdfDoc.text(`$${item.unitPrice.toFixed(2)}`, 370, y, { width: 80, align: 'right' });
      pdfDoc.text(`$${item.amount.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
      
      y += 20;
    });
    
    // Draw a line
    pdfDoc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // Totals
    pdfDoc.fontSize(10).text('Subtotal:', 350, y, { width: 100, align: 'right' });
    pdfDoc.text(`$${invoice.subtotal.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    y += 15;
    
    pdfDoc.text(`IVA (${invoice.taxRate}%):`, 350, y, { width: 100, align: 'right' });
    pdfDoc.text(`$${invoice.taxAmount.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    y += 15;
    
    pdfDoc.fontSize(12).text('Total:', 350, y, { width: 100, align: 'right' });
    pdfDoc.text(`$${invoice.total.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
    
    // Notes
    if (invoice.notes) {
      pdfDoc.moveDown(2);
      pdfDoc.fontSize(14).text('Notas', { underline: true });
      pdfDoc.fontSize(10).text(invoice.notes);
    }
    
    // Payment status
    pdfDoc.moveDown(2);
    pdfDoc.fontSize(14).text('Estado de pago', { underline: true });
    pdfDoc.fontSize(12).text(`Estado: ${invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Vencida'}`);
    
    if (invoice.status === 'paid') {
      pdfDoc.text(`Fecha de pago: ${new Date(invoice.paymentDate).toLocaleDateString()}`);
      if (invoice.paymentMethod) {
        const methods = {
          bank_transfer: 'Transferencia bancaria',
          credit_card: 'Tarjeta de crédito',
          cash: 'Efectivo',
          paypal: 'PayPal',
          other: 'Otro'
        };
        pdfDoc.text(`Método de pago: ${methods[invoice.paymentMethod] || invoice.paymentMethod}`);
      }
      if (invoice.paymentReference) {
        pdfDoc.text(`Referencia de pago: ${invoice.paymentReference}`);
      }
    }
    
    // Footer
    const pageCount = pdfDoc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      pdfDoc.switchToPage(i);
      
      // Add page number
      pdfDoc.fontSize(8).text(
        `Página ${i + 1} de ${pageCount}`,
        50,
        pdfDoc.page.height - 50,
        { align: 'center' }
      );
      
      // Add footer
      pdfDoc.fontSize(8).text(
        `Generado por: ${invoice.createdBy.name} | ${invoice.createdBy.email}`,
        50,
        pdfDoc.page.height - 35,
        { align: 'center' }
      );
    }
    
    // Finalize the PDF
    pdfDoc.end();
    
    // Wait for PDF to be created
    await new Promise((resolve) => {
      pdfStream.on('finish', resolve);
    });
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Prepare email
    const mailOptions = {
      from: `"${invoice.createdBy.name}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject || `Factura #${invoice.invoiceNumber} - ${invoice.client.name}`,
      html: message || `
        <p>Estimado/a cliente,</p>
        <p>Adjunto encontrará la factura #${invoice.invoiceNumber} correspondiente al proyecto "${invoice.project.name}".</p>
        <p>Fecha de emisión: ${new Date(invoice.date).toLocaleDateString()}</p>
        <p>Fecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p>Total a pagar: $${invoice.total.toFixed(2)}</p>
        <p>Por favor, no dude en contactarnos si tiene alguna pregunta.</p>
        <p>Saludos cordiales,</p>
        <p>${invoice.createdBy.name}</p>
      `,
      attachments: [
        {
          filename: `factura-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ]
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Remove temporary PDF file
    fs.unlinkSync(pdfPath);
    
    // Update invoice to record that it was sent
    invoice.emailSent = true;
    invoice.emailSentDate = new Date();
    invoice.emailSentTo = to;
    await invoice.save();
    
    res.status(200).json({ message: 'Factura enviada por correo electrónico correctamente' });
  } catch (error) {
    console.error('Error sending invoice by email:', error);
    res.status(500).json({ message: 'Error al enviar la factura por correo electrónico' });
  }
};
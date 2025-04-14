const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const TimeEntry = require('../models/TimeEntry');
const Invoice = require('../models/Invoice');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Función para crear datos de prueba
const seedData = async () => {
  try {
    // Limpiar base de datos
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await TimeEntry.deleteMany({});
    await Invoice.deleteMany({});

    console.log('Base de datos limpiada');

    // Crear usuario de prueba
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      password: hashedPassword,
      company: {
        name: 'Mi Empresa Freelance',
        address: 'Calle Principal 123, Santiago, Chile',
        phone: '+56 9 1234 5678',
        taxId: '12.345.678-9'
      },
      settings: {
        defaultHourlyRate: 25000,
        currency: 'CLP',
        language: 'es'
      }
    });

    console.log('Usuario creado:', user.email);

    // Crear clientes
    const clients = await Client.insertMany([
      {
        user: user._id,
        name: 'Juan Pérez',
        email: 'juan@empresa1.com',
        phone: '+56 9 8765 4321',
        company: 'Empresa A',
        address: 'Av. Libertador 456, Santiago, Chile',
        taxId: '98.765.432-1',
        notes: 'Cliente importante'
      },
      {
        user: user._id,
        name: 'María González',
        email: 'maria@empresa2.com',
        phone: '+56 9 5555 5555',
        company: 'Empresa B',
        address: 'Calle Comercio 789, Viña del Mar, Chile',
        taxId: '87.654.321-0',
        notes: 'Prefiere comunicación por email'
      },
      {
        user: user._id,
        name: 'Carlos Rodríguez',
        email: 'carlos@empresa3.com',
        phone: '+56 9 6666 6666',
        company: 'Empresa C',
        address: 'Pasaje Industrial 101, Concepción, Chile',
        taxId: '76.543.210-9',
        notes: 'Nuevo cliente'
      }
    ]);

    console.log('Clientes creados:', clients.length);

    // Crear proyectos
    const projects = await Project.insertMany([
      {
        user: user._id,
        client: clients[0]._id,
        name: 'Diseño de sitio web',
        description: 'Diseño y desarrollo de sitio web corporativo',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-03-30'),
        status: 'completed',
        hourlyRate: 30000,
        billingType: 'hourly',
        notes: 'Incluye 3 revisiones'
      },
      {
        user: user._id,
        client: clients[1]._id,
        name: 'Desarrollo de aplicación móvil',
        description: 'Aplicación móvil para gestión de inventario',
        startDate: new Date('2023-04-10'),
        status: 'in_progress',
        hourlyRate: 35000,
        billingType: 'hourly',
        notes: 'Fase 1: Android, Fase 2: iOS'
      },
      {
        user: user._id,
        client: clients[2]._id,
        name: 'Mantenimiento de plataforma',
        description: 'Mantenimiento mensual de plataforma e-commerce',
        startDate: new Date('2023-02-01'),
        status: 'in_progress',
        hourlyRate: 25000,
        billingType: 'hourly',
        notes: 'Contrato renovable mensualmente'
      },
      {
        user: user._id,
        client: clients[0]._id,
        name: 'Campaña de marketing digital',
        description: 'Diseño y ejecución de campaña en redes sociales',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-06-30'),
        status: 'pending',
        fixedPrice: 1500000,
        billingType: 'fixed',
        notes: 'Pago 50% al inicio, 50% al finalizar'
      }
    ]);

    console.log('Proyectos creados:', projects.length);

    // Crear entradas de tiempo
    const timeEntries = await TimeEntry.insertMany([
      {
        user: user._id,
        project: projects[0]._id,
        description: 'Diseño de página de inicio',
        date: new Date('2023-01-20'),
        duration: 4,
        billable: true,
        hourlyRate: 30000
      },
      {
        user: user._id,
        project: projects[0]._id,
        description: 'Implementación de formulario de contacto',
        date: new Date('2023-01-25'),
        duration: 2.5,
        billable: true,
        hourlyRate: 30000
      },
      {
        user: user._id,
        project: projects[1]._id,
        description: 'Diseño de interfaz de usuario',
        date: new Date('2023-04-15'),
        duration: 6,
        billable: true,
        hourlyRate: 35000
      },
      {
        user: user._id,
        project: projects[1]._id,
        description: 'Implementación de autenticación',
        date: new Date('2023-04-20'),
        duration: 4,
        billable: true,
        hourlyRate: 35000
      },
      {
        user: user._id,
        project: projects[2]._id,
        description: 'Corrección de errores',
        date: new Date('2023-02-10'),
        duration: 3,
        billable: true,
        hourlyRate: 25000
      },
      {
        user: user._id,
        project: projects[2]._id,
        description: 'Actualización de plugins',
        date: new Date('2023-03-05'),
        duration: 1.5,
        billable: true,
        hourlyRate: 25000
      }
    ]);

    console.log('Entradas de tiempo creadas:', timeEntries.length);

    // Crear facturas
    const invoices = await Invoice.insertMany([
      {
        user: user._id,
        client: clients[0]._id,
        invoiceNumber: 'INV-00001',
        issueDate: new Date('2023-02-01'),
        dueDate: new Date('2023-02-15'),
        status: 'paid',
        items: [
          {
            description: 'Diseño de página de inicio',
            quantity: 4,
            unitPrice: 30000,
            amount: 120000
          },
          {
            description: 'Implementación de formulario de contacto',
            quantity: 2.5,
            unitPrice: 30000,
            amount: 75000
          }
        ],
        subtotal: 195000,
        taxRate: 19,
        taxAmount: 37050,
        total: 232050,
        notes: 'Gracias por su preferencia',
        terms: 'Pago a 15 días',
        paymentDetails: 'Transferencia bancaria a Cuenta Corriente N° 123456789'
      },
      {
        user: user._id,
        client: clients[1]._id,
        invoiceNumber: 'INV-00002',
        issueDate: new Date('2023-05-01'),
        dueDate: new Date('2023-05-15'),
        status: 'sent',
        items: [
          {
            description: 'Diseño de interfaz de usuario',
            quantity: 6,
            unitPrice: 35000,
            amount: 210000
          },
          {
            description: 'Implementación de autenticación',
            quantity: 4,
            unitPrice: 35000,
            amount: 140000
          }
        ],
        subtotal: 350000,
        taxRate: 19,
        taxAmount: 66500,
        total: 416500,
        notes: 'Gracias por su preferencia',
        terms: 'Pago a 15 días',
        paymentDetails: 'Transferencia bancaria a Cuenta Corriente N° 123456789'
      },
      {
        user: user._id,
        client: clients[2]._id,
        invoiceNumber: 'INV-00003',
        issueDate: new Date('2023-03-01'),
        dueDate: new Date('2023-03-15'),
        status: 'paid',
        items: [
          {
            description: 'Corrección de errores',
            quantity: 3,
            unitPrice: 25000,
            amount: 75000
          },
          {
            description: 'Actualización de plugins',
            quantity: 1.5,
            unitPrice: 25000,
            amount: 37500
          }
        ],
        subtotal: 112500,
        taxRate: 19,
        taxAmount: 21375,
        total: 133875,
        notes: 'Gracias por su preferencia',
        terms: 'Pago a 15 días',
        paymentDetails: 'Transferencia bancaria a Cuenta Corriente N° 123456789'
      }
    ]);

    console.log('Facturas creadas:', invoices.length);

    console.log('Datos de prueba creados exitosamente');
    process.exit();
  } catch (error) {
    console.error('Error al crear datos de prueba:', error);
    process.exit(1);
  }
};

// Ejecutar función
seedData();
import { v4 as uuidv4 } from 'uuid';

// Datos iniciales
let clients = [
  {
    id: '1',
    name: 'Empresa ABC',
    email: 'contacto@empresaabc.com',
    phone: '912345678',
    address: 'Calle Principal 123, Madrid',
    notes: 'Cliente desde 2020'
  },
  {
    id: '2',
    name: 'Cliente XYZ',
    email: 'info@clientexyz.com',
    phone: '654321987',
    address: 'Avenida Central 456, Barcelona',
    notes: 'Prefiere comunicación por email'
  },
  {
    id: '3',
    name: 'Empresa 123',
    email: 'admin@empresa123.com',
    phone: '678912345',
    address: 'Plaza Mayor 789, Valencia',
    notes: ''
  }
];

let invoices = [
  {
    id: '1',
    number: '2023-001',
    clientId: '1',
    clientName: 'Empresa ABC',
    date: '2023-03-01',
    dueDate: '2023-03-15',
    status: 'Pagada',
    items: [
      { description: 'Diseño de página web', quantity: 1, unitPrice: 2500, amount: 2500 }
    ],
    subtotal: 2500,
    taxRate: 21,
    taxAmount: 525,
    total: 3025,
    notes: 'Pago recibido el 10/03/2023'
  },
  {
    id: '2',
    number: '2023-002',
    clientId: '2',
    clientName: 'Cliente XYZ',
    date: '2023-03-15',
    dueDate: '2023-03-30',
    status: 'Pendiente',
    items: [
      { description: 'Primer pago desarrollo app', quantity: 1, unitPrice: 3000, amount: 3000 }
    ],
    subtotal: 3000,
    taxRate: 21,
    taxAmount: 630,
    total: 3630,
    notes: 'Primer pago del proyecto'
  },
  {
    id: '3',
    number: '2023-003',
    clientId: '3',
    clientName: 'Empresa 123',
    date: '2023-03-31',
    dueDate: '2023-04-15',
    status: 'Borrador',
    items: [
      { description: 'Mantenimiento mensual marzo', quantity: 1, unitPrice: 300, amount: 300 }
    ],
    subtotal: 300,
    taxRate: 21,
    taxAmount: 63,
    total: 363,
    notes: 'Factura mensual de mantenimiento'
  }
];

// API de clientes
const clientsApi = {
  getAll: () => {
    return Promise.resolve([...clients]);
  },
  
  getById: (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) {
      return Promise.reject(new Error('Cliente no encontrado'));
    }
    return Promise.resolve({...client});
  },
  
  create: (clientData) => {
    const newClient = {
      id: uuidv4(),
      ...clientData
    };
    clients.push(newClient);
    return Promise.resolve({...newClient});
  },
  
  update: (id, clientData) => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Cliente no encontrado'));
    }
    
    const updatedClient = {
      ...clients[index],
      ...clientData,
      id // Asegurarse de que el ID no cambie
    };
    
    clients[index] = updatedClient;
    return Promise.resolve({...updatedClient});
  },
  
  delete: (id) => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Cliente no encontrado'));
    }
    
    clients = clients.filter(c => c.id !== id);
    return Promise.resolve({ success: true });
  }
};

// API de facturas
const invoicesApi = {
  getAll: (filters = {}) => {
    let filteredInvoices = [...invoices];
    
    if (filters.clientId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.clientId === filters.clientId);
    }
    
    if (filters.status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.date) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.date) <= endDate);
    }
    
    return Promise.resolve(filteredInvoices);
  },
  
  getById: (id) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    return Promise.resolve({...invoice});
  },
  
  create: (invoiceData) => {
    // Buscar el cliente para obtener su nombre
    const client = clients.find(c => c.id === invoiceData.clientId);
    
    const newInvoice = {
      id: uuidv4(),
      ...invoiceData,
      clientName: client ? client.name : 'Cliente desconocido'
    };
    
    invoices.push(newInvoice);
    return Promise.resolve({...newInvoice});
  },
  
  update: (id, invoiceData) => {
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    
    // Si el clientId ha cambiado, actualizar el clientName
    let clientName = invoices[index].clientName;
    if (invoiceData.clientId && invoiceData.clientId !== invoices[index].clientId) {
      const client = clients.find(c => c.id === invoiceData.clientId);
      clientName = client ? client.name : 'Cliente desconocido';
    }
    
    const updatedInvoice = {
      ...invoices[index],
      ...invoiceData,
      clientName,
      id // Asegurarse de que el ID no cambie
    };
    
    invoices[index] = updatedInvoice;
    return Promise.resolve({...updatedInvoice});
  },
  
  delete: (id) => {
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    
    invoices = invoices.filter(inv => inv.id !== id);
    return Promise.resolve({ success: true });
  },
  
  markAsPaid: (id) => {
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    
    invoices[index] = {
      ...invoices[index],
      status: 'Pagada'
    };
    
    return Promise.resolve({...invoices[index]});
  },
  
  sendReminder: (id) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    
    // Simular el envío de un recordatorio
    console.log(`Recordatorio enviado para la factura #${invoice.number}`);
    
    return Promise.resolve({ success: true, message: 'Recordatorio enviado correctamente' });
  },
  
  sendByEmail: (id) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) {
      return Promise.reject(new Error('Factura no encontrada'));
    }
    
    // Simular el envío por email
    console.log(`Factura #${invoice.number} enviada por email`);
    
    return Promise.resolve({ success: true, message: 'Factura enviada correctamente' });
  }
};

export { clientsApi, invoicesApi };
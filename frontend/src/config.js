// Configuración de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Otras configuraciones
export const APP_NAME = 'Gestión Freelance';
export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_LOCALE = 'es-ES';
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';

// Configuración de paginación
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// Configuración de fechas
export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Configuración de moneda
export const CURRENCY = 'EUR';
export const CURRENCY_SYMBOL = '€';

// Configuración de estados de proyectos
export const PROJECT_STATUSES = [
  'Pendiente',
  'En progreso',
  'Pausado',
  'Completado',
  'Cancelado'
];

// Configuración de estados de facturas
export const INVOICE_STATUSES = [
  'Borrador',
  'Enviada',
  'Pendiente',
  'Pagada',
  'Vencida',
  'Cancelada'
];

// Configuración de monedas
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
];
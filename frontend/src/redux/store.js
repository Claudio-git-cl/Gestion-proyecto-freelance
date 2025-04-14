import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import timeTrackingReducer from './slices/timeTrackingSlice';
import invoiceReducer from './slices/invoiceSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    projects: projectReducer,
    tasks: taskReducer,
    timeTracking: timeTrackingReducer,
    invoices: invoiceReducer,
    settings: settingsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones no serializables para fechas
        ignoredActions: ['invoices/createInvoice/fulfilled', 'invoices/updateInvoice/fulfilled'],
        // Ignorar rutas de estado no serializables
        ignoredPaths: ['invoices.invoice.date', 'invoices.invoice.dueDate']
      }
    })
});

export default store;
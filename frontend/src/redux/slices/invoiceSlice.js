import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const snapshot = await getDocs(invoicesRef);
      
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return invoices;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);
      
      if (!invoiceDoc.exists()) {
        return rejectWithValue('La factura no existe');
      }
      
      return {
        id: invoiceDoc.id,
        ...invoiceDoc.data()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInvoicesByProject = createAsyncThunk(
  'invoices/fetchInvoicesByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return invoices;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInvoicesByClient = createAsyncThunk(
  'invoices/fetchInvoicesByClient',
  async (clientId, { rejectWithValue }) => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return invoices;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const docRef = await addDoc(invoicesRef, {
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Si hay entradas de tiempo asociadas, marcarlas como facturadas
      if (invoiceData.items) {
        const timeEntryIds = invoiceData.items
          .filter(item => item.timeEntryIds)
          .flatMap(item => item.timeEntryIds);
        
        for (const entryId of timeEntryIds) {
          const entryRef = doc(db, 'timeEntries', entryId);
          await updateDoc(entryRef, {
            invoiced: true,
            invoiceId: docRef.id
          });
        }
      }
      
      return {
        id: docRef.id,
        ...invoiceData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ invoiceId, invoiceData }, { rejectWithValue, getState }) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      
      // Obtener la factura actual para comparar los items
      const currentInvoice = getState().invoices.invoice;
      
      // Actualizar la factura
      await updateDoc(invoiceRef, {
        ...invoiceData,
        updatedAt: new Date().toISOString()
      });
      
      // Gestionar las entradas de tiempo
      if (currentInvoice && invoiceData.items) {
        // Obtener todos los IDs de entradas de tiempo de la factura actual
        const currentTimeEntryIds = currentInvoice.items
          ? currentInvoice.items
              .filter(item => item.timeEntryIds)
              .flatMap(item => item.timeEntryIds)
          : [];
        
        // Obtener todos los IDs de entradas de tiempo de la factura actualizada
        const newTimeEntryIds = invoiceData.items
          .filter(item => item.timeEntryIds)
          .flatMap(item => item.timeEntryIds);
        
        // Entradas que ya no están en la factura
        const removedEntryIds = currentTimeEntryIds.filter(id => !newTimeEntryIds.includes(id));
        
        // Entradas nuevas en la factura
        const addedEntryIds = newTimeEntryIds.filter(id => !currentTimeEntryIds.includes(id));
        
        // Marcar entradas eliminadas como no facturadas
        for (const entryId of removedEntryIds) {
          const entryRef = doc(db, 'timeEntries', entryId);
          await updateDoc(entryRef, {
            invoiced: false,
            invoiceId: null
          });
        }
        
        // Marcar nuevas entradas como facturadas
        for (const entryId of addedEntryIds) {
          const entryRef = doc(db, 'timeEntries', entryId);
          await updateDoc(entryRef, {
            invoiced: true,
            invoiceId: invoiceId
          });
        }
      }
      
      return {
        id: invoiceId,
        ...invoiceData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInvoiceStatus = createAsyncThunk(
  'invoices/updateInvoiceStatus',
  async ({ invoiceId, status }, { rejectWithValue }) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      
      await updateDoc(invoiceRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: invoiceId,
        status
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (invoiceId, { rejectWithValue, getState }) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      
      // Obtener la factura actual para liberar las entradas de tiempo
      const currentInvoice = getState().invoices.invoices.find(inv => inv.id === invoiceId);
      
      // Eliminar la factura
      await deleteDoc(invoiceRef);
      
      // Liberar las entradas de tiempo asociadas
      if (currentInvoice && currentInvoice.items) {
        const timeEntryIds = currentInvoice.items
          .filter(item => item.timeEntryIds)
          .flatMap(item => item.timeEntryIds);
        
        for (const entryId of timeEntryIds) {
          const entryRef = doc(db, 'timeEntries', entryId);
          await updateDoc(entryRef, {
            invoiced: false,
            invoiceId: null
          });
        }
      }
      
      return invoiceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    invoice: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
    resetInvoiceSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchInvoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchInvoiceById
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.invoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchInvoicesByProject
      .addCase(fetchInvoicesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoicesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchInvoicesByClient
      .addCase(fetchInvoicesByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoicesByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createInvoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.push(action.payload);
        state.success = true;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // updateInvoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.map(invoice => 
          invoice.id === action.payload.id ? action.payload : invoice
        );
        state.invoice = action.payload;
        state.success = true;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // updateInvoiceStatus
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.map(invoice => 
          invoice.id === action.payload.id 
            ? { ...invoice, status: action.payload.status } 
            : invoice
        );
        if (state.invoice && state.invoice.id === action.payload.id) {
          state.invoice = { ...state.invoice, status: action.payload.status };
        }
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteInvoice
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
        if (state.invoice && state.invoice.id === action.payload) {
          state.invoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearInvoiceError, resetInvoiceSuccess } = invoiceSlice.actions;

export default invoiceSlice.reducer;
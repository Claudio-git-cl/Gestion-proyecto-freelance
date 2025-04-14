import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Acción para obtener todos los clientes
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/clients');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener los clientes');
    }
  }
);

// Acción para obtener un cliente por ID
export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/clients/${clientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener el cliente');
    }
  }
);

// Acción para crear un nuevo cliente
export const addClient = createAsyncThunk(
  'clients/addClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/clients', clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear el cliente');
    }
  }
);

// Acción para actualizar un cliente
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ clientId, clientData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/clients/${clientId}`, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar el cliente');
    }
  }
);

// Acción para eliminar un cliente
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (clientId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/clients/${clientId}`);
      return clientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar el cliente');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    currentClient: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearClientError: (state) => {
      state.error = null;
    },
    clearClientSuccess: (state) => {
      state.success = false;
    },
    setCurrentClient: (state, action) => {
      state.currentClient = action.payload;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchClients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para fetchClientById
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para addClient
      .addCase(addClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.success = true;
      })
      .addCase(addClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para updateClient
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        state.currentClient = action.payload;
        state.success = true;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para deleteClient
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
        if (state.currentClient && state.currentClient.id === action.payload) {
          state.currentClient = null;
        }
        state.success = true;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearClientError, 
  clearClientSuccess, 
  setCurrentClient, 
  clearCurrentClient 
} = clientSlice.actions;

export default clientSlice.reducer;
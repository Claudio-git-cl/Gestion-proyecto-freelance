import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Acción para obtener todas las entradas de tiempo
export const fetchTimeEntries = createAsyncThunk(
  'timeTracking/fetchTimeEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/time-entries');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener las entradas de tiempo');
    }
  }
);

// Acción para obtener entradas de tiempo por proyecto
export const fetchTimeEntriesByProject = createAsyncThunk(
  'timeTracking/fetchTimeEntriesByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/time-entries/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener las entradas de tiempo del proyecto');
    }
  }
);

// Acción para crear una nueva entrada de tiempo
export const addTimeEntry = createAsyncThunk(
  'timeTracking/addTimeEntry',
  async (timeEntryData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/time-entries', timeEntryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear la entrada de tiempo');
    }
  }
);

// Acción para actualizar una entrada de tiempo
export const updateTimeEntry = createAsyncThunk(
  'timeTracking/updateTimeEntry',
  async ({ timeEntryId, timeEntryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/time-entries/${timeEntryId}`, timeEntryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la entrada de tiempo');
    }
  }
);

// Acción para eliminar una entrada de tiempo
export const deleteTimeEntry = createAsyncThunk(
  'timeTracking/deleteTimeEntry',
  async (timeEntryId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/time-entries/${timeEntryId}`);
      return timeEntryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar la entrada de tiempo');
    }
  }
);

// Acción para iniciar el temporizador
export const startTimer = createAsyncThunk(
  'timeTracking/startTimer',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/time-entries/start', { projectId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar el temporizador');
    }
  }
);

// Acción para detener el temporizador
export const stopTimer = createAsyncThunk(
  'timeTracking/stopTimer',
  async (timeEntryId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/time-entries/${timeEntryId}/stop`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al detener el temporizador');
    }
  }
);

// Acción para generar informes de tiempo
export const generateTimeReport = createAsyncThunk(
  'timeTracking/generateTimeReport',
  async (reportParams, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/time-entries/report', reportParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar el informe de tiempo');
    }
  }
);

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState: {
    timeEntries: [],
    filteredEntries: [],
    currentTimeEntry: null,
    activeTimer: null,
    report: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearTimeTrackingError: (state) => {
      state.error = null;
    },
    clearTimeTrackingSuccess: (state) => {
      state.success = false;
    },
    setCurrentTimeEntry: (state, action) => {
      state.currentTimeEntry = action.payload;
    },
    clearCurrentTimeEntry: (state) => {
      state.currentTimeEntry = null;
    },
    filterTimeEntries: (state, action) => {
      const { startDate, endDate, projectId, billable } = action.payload;
      
      state.filteredEntries = state.timeEntries.filter(entry => {
        let match = true;
        
        if (startDate && new Date(entry.startTime) < new Date(startDate)) {
          match = false;
        }
        
        if (endDate && new Date(entry.endTime) > new Date(endDate)) {
          match = false;
        }
        
        if (projectId && entry.projectId !== projectId) {
          match = false;
        }
        
        if (billable !== undefined && entry.billable !== billable) {
          match = false;
        }
        
        return match;
      });
    },
    clearReport: (state) => {
      state.report = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchTimeEntries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries = action.payload;
        state.filteredEntries = action.payload;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para fetchTimeEntriesByProject
      .addCase(fetchTimeEntriesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeEntriesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredEntries = action.payload;
      })
      .addCase(fetchTimeEntriesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para addTimeEntry
      .addCase(addTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries.push(action.payload);
        state.filteredEntries.push(action.payload);
        state.success = true;
      })
      .addCase(addTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para updateTimeEntry
      .addCase(updateTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timeEntries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.timeEntries[index] = action.payload;
        }
        
        const filteredIndex = state.filteredEntries.findIndex(entry => entry.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredEntries[filteredIndex] = action.payload;
        }
        
        if (state.currentTimeEntry && state.currentTimeEntry.id === action.payload.id) {
          state.currentTimeEntry = action.payload;
        }
        
        state.success = true;
      })
      .addCase(updateTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para deleteTimeEntry
      .addCase(deleteTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries = state.timeEntries.filter(entry => entry.id !== action.payload);
        state.filteredEntries = state.filteredEntries.filter(entry => entry.id !== action.payload);
        
        if (state.currentTimeEntry && state.currentTimeEntry.id === action.payload) {
          state.currentTimeEntry = null;
        }
        
        state.success = true;
      })
      .addCase(deleteTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para startTimer
      .addCase(startTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTimer = action.payload;
        state.timeEntries.push(action.payload);
        state.filteredEntries.push(action.payload);
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para stopTimer
      .addCase(stopTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTimer = null;
        
        const index = state.timeEntries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.timeEntries[index] = action.payload;
        }
        
        const filteredIndex = state.filteredEntries.findIndex(entry => entry.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredEntries[filteredIndex] = action.payload;
        }
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Casos para generateTimeReport
      .addCase(generateTimeReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTimeReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(generateTimeReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearTimeTrackingError,
  clearTimeTrackingSuccess,
  setCurrentTimeEntry,
  clearCurrentTimeEntry,
  filterTimeEntries,
  clearReport
} = timeTrackingSlice.actions;

export default timeTrackingSlice.reducer;
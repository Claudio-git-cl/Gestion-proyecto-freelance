import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Thunks
export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/conversations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error al obtener las conversaciones');
    }
  }
);

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`);
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error al obtener los mensajes');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, text }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error al enviar el mensaje');
    }
  }
);

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async ({ recipientId, projectId, initialMessage }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/conversations`, {
        recipientId,
        projectId,
        initialMessage
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error al crear la conversación');
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: {}, // Objeto con conversationId como clave y array de mensajes como valor
    loading: false,
    error: null
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Conversations
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
        
        // Marcar mensajes como leídos
        state.conversations = state.conversations.map(conv => {
          if (conv.id === conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        });
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        
        // Agregar mensaje a la conversación
        if (state.messages[message.conversationId]) {
          state.messages[message.conversationId].push(message);
        } else {
          state.messages[message.conversationId] = [message];
        }
        
        // Actualizar último mensaje en la conversación
        state.conversations = state.conversations.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: message.text,
                timestamp: message.timestamp
              }
            };
          }
          return conv;
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newConversation = action.payload;
        
        // Agregar nueva conversación
        state.conversations.unshift(newConversation);
        
        // Establecer como conversación activa
        state.activeConversation = newConversation;
        
        // Inicializar mensajes
        if (newConversation.initialMessage) {
          state.messages[newConversation.id] = [newConversation.initialMessage];
        } else {
          state.messages[newConversation.id] = [];
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setActiveConversation, clearError } = messageSlice.actions;
export default messageSlice.reducer;
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chatApi.js';
import { sessionExpired, signOut } from '../auth/authSlice.js';

function getErrorDetails(error) {
  return {
    message: error.message,
    errors: error.errors ?? [],
    status: error.status ?? 0,
  };
}

export const loadConversation = createAsyncThunk('chat/load', async (userId, { rejectWithValue }) => {
  try {
    return await chatApi.getConversation(userId);
  } catch (error) {
    return rejectWithValue(getErrorDetails(error));
  }
});

export const sendMessage = createAsyncThunk('chat/send', async ({ userId, text }, { rejectWithValue }) => {
  try {
    return await chatApi.sendMessage(userId, text);
  } catch (error) {
    return rejectWithValue(getErrorDetails(error));
  }
}, {
  getPendingMeta: (_, { getState }) => ({ senderId: getState().auth.user?.id }),
});

const initialState = {
  userId: null,
  participant: null,
  messages: [],
  status: 'idle',
  error: null,
};

// Responses can land after the user has opened a different conversation.
function isCurrentConversation(state, userId) {
  return state.userId === userId;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    messageRemoved(state, action) {
      state.messages = state.messages.filter((message) => message.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversation.pending, (state, action) => {
        if (state.userId !== action.meta.arg) {
          state.participant = null;
          state.messages = [];
        }
        state.userId = action.meta.arg;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadConversation.fulfilled, (state, action) => {
        if (!isCurrentConversation(state, action.meta.arg)) return;
        state.participant = action.payload.participant;
        state.messages = action.payload.messages;
        state.status = 'ready';
      })
      .addCase(loadConversation.rejected, (state, action) => {
        if (!isCurrentConversation(state, action.meta.arg)) return;
        state.status = 'failed';
        state.error = action.payload ?? getErrorDetails(action.error);
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { userId, text } = action.meta.arg;
        if (!isCurrentConversation(state, userId)) return;
        state.messages.push({
          id: action.meta.requestId,
          sender: action.meta.senderId,
          text,
          createdAt: new Date().toISOString(),
          delivery: 'sending',
        });
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!isCurrentConversation(state, action.meta.arg.userId)) return;
        const index = state.messages.findIndex((message) => message.id === action.meta.requestId);
        if (index !== -1) {
          state.messages[index] = action.payload.message;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        if (!isCurrentConversation(state, action.meta.arg.userId)) return;
        const message = state.messages.find((item) => item.id === action.meta.requestId);
        if (message) {
          message.delivery = 'failed';
          message.error = action.payload?.message ?? action.error.message;
        }
      })
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { messageRemoved } = chatSlice.actions;
export default chatSlice.reducer;

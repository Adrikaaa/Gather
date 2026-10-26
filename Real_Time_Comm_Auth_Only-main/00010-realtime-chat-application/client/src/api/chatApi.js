import { api } from './apiClient.js';

export const chatApi = {
  getConversation: (userId) => api.get(`/chats/${encodeURIComponent(userId)}`),
  sendMessage: (userId, text) => api.post(`/chats/${encodeURIComponent(userId)}/messages`, { text }),
};

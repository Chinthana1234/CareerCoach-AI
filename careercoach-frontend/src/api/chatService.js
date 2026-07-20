import API from './axios';

// Get all chat sessions for the logged-in user
export const getChatSessions = () => API.get('/chat/sessions');

// Create a new chat session
export const createChatSession = (title) => {
  const url = title ? `/chat/sessions?title=${encodeURIComponent(title)}` : '/chat/sessions';
  return API.post(url);
};  

// Delete a chat session
export const deleteChatSession = (sessionId) => API.delete(`/chat/sessions/${sessionId}`);

// Get all message history for a chat session
export const getChatMessages = (sessionId) => API.get(`/chat/sessions/${sessionId}/messages`);

// Get stream endpoint URL for EventSource (needs base URL, token, and prompt)
export const getChatStreamUrl = (sessionId, prompt) => {
  const token = localStorage.getItem('token');
  const baseURL = 'http://localhost:8080/api';
  return `${baseURL}/chat/sessions/${sessionId}/stream?prompt=${encodeURIComponent(prompt)}&token=${token}`;
};

import API from './axios';

// Start a new mock interview session for a target job role
export const startInterview = (jobTitle) => {
  const url = jobTitle ? `/interview/sessions?jobTitle=${encodeURIComponent(jobTitle)}` : '/interview/sessions';
  return API.post(url);
};

// Submit an answer for the current question in a session
export const submitAnswer = (sessionId, answer) => {
  return API.post(`/interview/sessions/${sessionId}/answer`, { answer });
};

// Get the state of a specific interview session
export const getInterviewSession = (sessionId) => {
  return API.get(`/interview/sessions/${sessionId}`);
};

// Get the dialogue history of an interview session
export const getInterviewMessages = (sessionId) => {
  return API.get(`/interview/sessions/${sessionId}/messages`);
};

// Get the history of all mock interviews for the user
export const getInterviewHistory = () => {
  return API.get('/interview/history');
};

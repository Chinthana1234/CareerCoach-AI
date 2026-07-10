import API from './axios';

// Start a new mock interview session for a target job role
export const startInterview = (jobTitle, interviewType = 'HR', topic = 'General') => {
  const params = [];
  if (jobTitle) params.push(`jobTitle=${encodeURIComponent(jobTitle)}`);
  if (interviewType) params.push(`interviewType=${encodeURIComponent(interviewType)}`);
  if (topic) params.push(`topic=${encodeURIComponent(topic)}`);
  
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  return API.post(`/interview/sessions${queryString}`);
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

// Delete an interview session
export const deleteInterview = (id) => {
  return API.delete(`/interview/${id}`);
};

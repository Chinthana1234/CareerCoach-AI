import axios from 'axios';

const API_URL = 'http://localhost:8080/api/roadmaps';

// Setup axios instance with token
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generateRoadmap = async (role) => {
  const response = await apiClient.post('/generate', { role });
  return response.data;
};

export const getRoadmapHistory = async () => {
  const response = await apiClient.get('/history');
  return response.data;
};

export const deleteRoadmap = async (id) => {
  const response = await apiClient.delete(`/${id}`);
  return response.data;
};

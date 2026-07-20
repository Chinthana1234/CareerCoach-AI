import API from './axios';

// Get all users
export const getAllUsers = () => API.get('/admin/users');

// Delete a user
export const deleteUser = (userId) => API.delete(`/admin/users/${userId}`);

// Update a user's role
export const updateUserRole = (userId, role) => API.put(`/admin/users/${userId}/role`, { role });

// Get dashboard stats
export const getDashboardStats = () => API.get('/admin/stats');

// Get chart data
export const getChartData = () => API.get('/admin/chart-data');

import api from './axios';

export const submitLinkedinReview = async (headline, about, experience) => {
  const response = await api.post('/api/linkedin/review', {
    headline,
    about,
    experience
  });
  return response.data;
};

// Get user's linkedin review history
export const getLinkedinReviewHistory = async () => {
  const response = await api.get('/api/linkedin/history');
  return response.data;
};

// Delete a linkedin review
export const deleteLinkedinReview = async (id) => {
  const response = await api.delete(`/api/linkedin/${id}`);
  return response.data;
};

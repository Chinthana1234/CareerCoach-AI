import api from './axiosConfig';

export const submitLinkedinReview = async (headline, about, experience) => {
  const response = await api.post('/api/linkedin/review', {
    headline,
    about,
    experience
  });
  return response.data;
};

export const getLinkedinReviewHistory = async () => {
  const response = await api.get('/api/linkedin/history');
  return response.data;
};

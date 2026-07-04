import API from './axios';

// Upload CV file (multipart/form-data)
export const uploadCv = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/cv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get the latest uploaded CV document for the current user
export const getLatestCv = () => API.get('/cv/latest');

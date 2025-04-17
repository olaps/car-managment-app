import api from './apiService';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/user/profile'),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences)
};
import axios from './axios';

export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (data) => axios.post('/auth/register', data),
  refresh: (refreshToken) => axios.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => axios.post('/auth/logout', { refreshToken }),
  getMe: () => axios.get('/auth/me'),
};
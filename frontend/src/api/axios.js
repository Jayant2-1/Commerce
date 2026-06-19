import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const rt = localStorage.getItem('refreshToken');
        if (!rt) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: rt });
        const { accessToken, refreshToken: newRt } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRt);
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(orig);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
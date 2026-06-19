import axios from './axios';

export const paymentApi = {
  getMethods: () => axios.get('/payments/methods'),
  initiate: (data) => axios.post('/payments/initiate', data),
  mockComplete: (data) => axios.post('/payments/mock-complete', data),
  verify: (data) => axios.post('/payments/verify', data),
  getForOrder: (orderId) => axios.get(`/payments/order/${orderId}`),
};
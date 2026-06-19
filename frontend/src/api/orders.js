import axios from './axios';

export const orderApi = {
  placeOrder: (data) => axios.post('/orders', data),
  getMyOrders: () => axios.get('/orders'),
  getById: (id) => axios.get(`/orders/${id}`),
  cancelOrder: (id) => axios.post(`/orders/${id}/cancel`),
};
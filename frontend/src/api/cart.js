import axios from './axios';

export const cartApi = {
  getCart: () => axios.get('/cart'),
  addItem: (data) => axios.post('/cart/items', data),
  updateItem: (cartItemId, data) => axios.put(`/cart/items/${cartItemId}`, data),
  removeItem: (cartItemId) => axios.delete(`/cart/items/${cartItemId}`),
};
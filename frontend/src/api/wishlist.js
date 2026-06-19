import axios from './axios';

export const wishlistApi = {
  getAll: () => axios.get('/wishlists'),
  getById: (id) => axios.get(`/wishlists/${id}`),
  create: (name) => axios.post('/wishlists', { name }),
  rename: (id, name) => axios.put(`/wishlists/${id}`, { name }),
  delete: (id) => axios.delete(`/wishlists/${id}`),
  addItem: (wishlistId, productId) => axios.post(`/wishlists/${wishlistId}/items/${productId}`),
  removeItem: (wishlistId, itemId) => axios.delete(`/wishlists/${wishlistId}/items/${itemId}`),
  moveToCart: (wishlistId, itemId, quantity) => axios.post(`/wishlists/${wishlistId}/items/${itemId}/move-to-cart`, null, { params: { quantity } }),
};
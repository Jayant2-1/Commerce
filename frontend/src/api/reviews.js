import axios from './axios';

export const reviewApi = {
  upsert: (data) => axios.post('/reviews', data),
  getByProduct: (productId, params) => axios.get(`/reviews/product/${productId}`, { params }),
};
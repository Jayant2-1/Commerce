import axios from './axios';

export const productApi = {
  getAll: (params) => axios.get('/products/search', { params }),
  getById: (id) => axios.get(`/products/${id}`),
  getBySlug: (slug) => axios.get(`/products/slug/${slug}`),
  search: (params) => axios.get('/search/products', { params }),
  getFeatured: (limit = 10) => axios.get('/products/featured', { params: { limit } }),
};
import axios from './axios';

export const categoryApi = {
  getTree: () => axios.get('/categories/tree'),
  getById: (id) => axios.get(`/categories/${id}`),
};
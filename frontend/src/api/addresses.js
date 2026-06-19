import axios from './axios';

export const addressApi = {
  list: () => axios.get('/addresses'),
  add: (data) => axios.post('/addresses', data),
  update: (id, data) => axios.put(`/addresses/${id}`, data),
  delete: (id) => axios.delete(`/addresses/${id}`),
};
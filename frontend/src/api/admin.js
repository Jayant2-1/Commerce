import axios from './axios';

export const adminApi = {
  // Products
  createProduct: (data) => axios.post('/admin/products', data),
  updateProduct: (id, data) => axios.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axios.delete(`/admin/products/${id}`),
  searchProducts: (params) => axios.get('/admin/products/search', { params }),

  // Categories
  createCategory: (data) => axios.post('/admin/categories', data),
  updateCategory: (id, data) => axios.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axios.delete(`/admin/categories/${id}`),
  listCategories: () => axios.get('/admin/categories'),

  // Orders
  getAllOrders: () => axios.get('/admin/orders'),
  getOrderById: (id) => axios.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, orderStatus) => axios.patch(`/admin/orders/${id}/status`, { orderStatus }),

  // Users
  listUsers: () => axios.get('/admin/users'),
  createUser: (data) => axios.post('/admin/users', data),
  updateUser: (id, data) => axios.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, active) => axios.patch(`/admin/users/${id}/status`, { active }),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),

  // Coupons
  createCoupon: (data) => axios.post('/admin/coupons', data),
  updateCoupon: (id, data) => axios.put(`/admin/coupons/${id}`, data),
  deactivateCoupon: (id) => axios.delete(`/admin/coupons/${id}`),
  listCoupons: () => axios.get('/admin/coupons'),

  // Inventory
  getInventory: (productId) => axios.get(`/admin/inventory/product/${productId}`),
  updateInventory: (data) => axios.put('/admin/inventory', data),

  // Reviews
  moderateReview: (id, status) => axios.patch(`/admin/reviews/${id}/moderate`, { status }),
};
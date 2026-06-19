import axios from './axios';

export const couponApi = {
  validate: (data) => axios.post('/coupons/validate', data),
};
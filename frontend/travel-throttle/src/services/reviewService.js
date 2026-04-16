/**
 * REVIEW SERVICE
 * User review related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const reviewService = {
  getReviewsByUser: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.REVIEWS.GET_FOR_USER(userId));
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      return { success: false, error: error.response?.data?.message, data: [] };
    }
  },

  getReviewsByRide: async (rideId) => {
    try {
      const response = await api.get(API_ENDPOINTS.REVIEWS.GET_FOR_RIDE(rideId));
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      return { success: false, error: error.response?.data?.message, data: [] };
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },
};

export default reviewService;
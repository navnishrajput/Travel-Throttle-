/**
 * COST SERVICE
 * Ride cost calculation API calls
 */

import api from './api';

export const costService = {
  /**
   * Get cost breakdown for a ride
   */
  getCostBreakdown: async (rideId) => {
    try {
      const response = await api.get(`/rides/${rideId}/cost-breakdown`);
      if (response?.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.message };
    } catch (error) {
      console.error('Get cost breakdown error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  },
};

export default costService;
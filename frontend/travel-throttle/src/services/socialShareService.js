/**
 * SOCIAL SHARE SERVICE
 * Social media sharing API calls
 */

import api from './api';

const SHARE_ENDPOINTS = {
  RIDE: '/share/ride',
  GROUP_RIDE: '/share/group-ride',
};

export const socialShareService = {
  /**
   * Share a ride
   */
  shareRide: async (rideId, platform, customMessage) => {
    try {
      const response = await api.post(SHARE_ENDPOINTS.RIDE, {
        rideId,
        platform,
        customMessage
      });
      
      if (response?.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.message };
    } catch (error) {
      console.error('Share ride error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  /**
   * Share a group ride
   */
  shareGroupRide: async (groupId, platform, customMessage) => {
    try {
      const response = await api.post(SHARE_ENDPOINTS.GROUP_RIDE, {
        rideId: groupId,
        platform,
        customMessage
      });
      
      if (response?.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.message };
    } catch (error) {
      console.error('Share group ride error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  },
};

export default socialShareService;
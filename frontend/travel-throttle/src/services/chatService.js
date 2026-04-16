/**
 * CHAT SERVICE
 * Group chat API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const chatService = {
  getMessages: async (rideId) => {
    try {
      console.log('=== GET MESSAGES ===', rideId);
      const response = await api.get(API_ENDPOINTS.CHAT.GET_MESSAGES(rideId));
      console.log('Messages response:', response);
      
      let messages = [];
      if (response?.success === true) {
        messages = response.data || [];
      } else if (response?.data?.success === true) {
        messages = response.data.data || [];
      } else if (Array.isArray(response?.data)) {
        messages = response.data;
      } else if (Array.isArray(response)) {
        messages = response;
      }
      
      return { success: true, data: messages };
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  sendMessage: async (rideId, content, attachmentUrl = null) => {
    try {
      console.log('=== SEND MESSAGE ===', { rideId, content });
      const response = await api.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
        rideId,
        content,
        attachmentUrl
      });
      console.log('Send message response:', response);
      
      let success = false;
      let data = null;
      
      if (response?.success === true) {
        success = true;
        data = response.data;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
      }
      
      return { success, data };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to send message' };
    }
  },
};

export default chatService;
/**
 * NOTIFICATION SERVICE
 * Notification related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const notificationService = {
  getMyNotifications: async () => {
    try {
      console.log('=== GET NOTIFICATIONS ===');
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL);
      console.log('Notifications response:', response);
      
      let notifications = [];
      if (response?.success === true) {
        notifications = response.data || [];
      } else if (response?.data?.success === true) {
        notifications = response.data.data || [];
      } else if (Array.isArray(response?.data)) {
        notifications = response.data;
      } else if (Array.isArray(response)) {
        notifications = response;
      }
      
      return { success: true, data: notifications };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: false, data: [] };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT);
      let count = 0;
      if (response?.success === true) {
        count = response.data?.count || 0;
      } else if (response?.data?.success === true) {
        count = response.data.data?.count || 0;
      }
      return { success: true, data: { count } };
    } catch (error) {
      return { success: false, data: { count: 0 } };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },
};

export default notificationService;
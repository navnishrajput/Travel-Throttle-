/**
 * USER SERVICE
 * User related API calls
 */

import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

export const userService = {
  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    try {
      console.log('=== GET CURRENT USER ===');
      const response = await api.get(API_ENDPOINTS.USER.PROFILE);
      console.log('Raw user response:', response);
      
      let userData = null;
      
      // Handle different response formats
      if (response?.success === true) {
        userData = response.data;
      } else if (response?.data?.success === true) {
        userData = response.data.data;
      } else if (response?.data) {
        userData = response.data;
      } else if (response?.id) {
        userData = response;
      }
      
      console.log('Processed user data:', userData);
      
      if (userData) {
        // Ensure all fields have default values
        userData = {
          id: userData.id || '',
          name: userData.name || 'User',
          email: userData.email || '',
          phone: userData.phone || '',
          hasBike: userData.hasBike ?? false,
          avatar: userData.avatar || null,
          verified: userData.verified ?? false,
          rating: userData.rating ?? 0.0,
          totalRides: userData.totalRides ?? 0,
          totalDistance: userData.totalDistance ?? 0,
          totalSaved: userData.totalSaved ?? 0.0,
          bio: userData.bio || '',
          address: userData.address || '',
          roles: userData.roles || [],
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLogin || null,
          initials: userData.initials || userData.name?.charAt(0)?.toUpperCase() || 'U',
          bikeCount: userData.bikeCount ?? 0,
          reviewCount: userData.reviewCount ?? 0,
        };
        
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Get current user error:', error);
      
      // Try to get from localStorage as fallback
      const cachedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (cachedUser) {
        try {
          return { success: true, data: JSON.parse(cachedUser) };
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user profile',
        data: null
      };
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   */
  getUserById: async (userId) => {
    try {
      console.log('=== GET USER BY ID ===', userId);
      const response = await api.get(API_ENDPOINTS.USER.GET_PUBLIC_PROFILE(userId));
      console.log('User by ID response:', response);
      
      let userData = null;
      
      if (response?.success === true) {
        userData = response.data;
      } else if (response?.data?.success === true) {
        userData = response.data.data;
      } else if (response?.data) {
        userData = response.data;
      }
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'User not found'
      };
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile data to update
   */
  updateProfile: async (profileData) => {
    try {
      console.log('=== UPDATE PROFILE ===');
      console.log('Update data:', profileData);
      
      const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
      console.log('Update profile response:', response);
      
      let success = false;
      let data = null;
      let message = 'Profile updated successfully';
      
      if (response?.success === true) {
        success = true;
        data = response.data;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
        message = response.data.message || message;
      }
      
      if (success && data) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
      }
      
      return { success, data, message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  },

  /**
   * Upload profile avatar
   * @param {File} file - Image file
   */
  uploadAvatar: async (file) => {
    try {
      console.log('=== UPLOAD AVATAR ===');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload avatar response:', response);
      
      let success = false;
      let data = null;
      
      if (response?.success === true) {
        success = true;
        data = response.data;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
      }
      
      if (success && data) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
      }
      
      return { success, data };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload avatar' 
      };
    }
  },

  /**
   * Delete profile avatar
   */
  deleteAvatar: async () => {
    try {
      console.log('=== DELETE AVATAR ===');
      const response = await api.delete(API_ENDPOINTS.USER.UPLOAD_AVATAR);
      console.log('Delete avatar response:', response);
      
      let success = false;
      
      if (response?.success === true) {
        success = true;
      } else if (response?.data?.success === true) {
        success = true;
      }
      
      if (success) {
        const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
        userData.avatar = null;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
      
      return { success };
    } catch (error) {
      console.error('Delete avatar error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete avatar' 
      };
    }
  },

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      console.log('=== CHANGE PASSWORD ===');
      const response = await api.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, { 
        oldPassword, 
        newPassword 
      });
      console.log('Change password response:', response);
      
      let success = false;
      let message = 'Password changed successfully';
      
      if (response?.success === true) {
        success = true;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        message = response.data.message || message;
      }
      
      return { success, message };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to change password' 
      };
    }
  },

  /**
   * Search users by name
   * @param {string} query - Search query
   */
  searchUsers: async (query) => {
    try {
      console.log('=== SEARCH USERS ===', query);
      const response = await api.get(`${API_ENDPOINTS.USER.SEARCH}?query=${encodeURIComponent(query)}`);
      console.log('Search users response:', response);
      
      let users = [];
      
      if (response?.success === true) {
        users = response.data || [];
      } else if (response?.data?.success === true) {
        users = response.data.data || [];
      } else if (Array.isArray(response?.data)) {
        users = response.data;
      }
      
      return { success: true, data: users };
    } catch (error) {
      console.error('Search users error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Search failed', 
        data: [] 
      };
    }
  },
};

export default userService;
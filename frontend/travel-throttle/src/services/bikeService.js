/**
 * BIKE SERVICE
 * Bike/Garage related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const bikeService = {
  /**
   * Get current user's bikes
   */
  getMyBikes: async () => {
    try {
      console.log('=== GET MY BIKES ===');
      const response = await api.get(API_ENDPOINTS.BIKES.GET_MY_BIKES);
      console.log('Raw bikes response:', response);
      
      // Handle different response formats
      let bikes = [];
      
      if (response.success === true) {
        // Format: { success: true, data: [...] }
        bikes = response.data || [];
      } else if (response.data?.success === true) {
        // Format: { data: { success: true, data: [...] } }
        bikes = response.data.data || [];
      } else if (Array.isArray(response)) {
        // Format: [...] directly
        bikes = response;
      } else if (Array.isArray(response.data)) {
        // Format: { data: [...] }
        bikes = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        // Format: { data: { content: [...] } }
        bikes = response.data.content;
      }
      
      console.log('Processed bikes:', bikes);
      
      return { 
        success: true, 
        data: bikes,
        message: 'Bikes fetched successfully'
      };
    } catch (error) {
      console.error('Get bikes error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch bikes', 
        data: [] 
      };
    }
  },

  /**
   * Get bike by ID
   * @param {string} bikeId - Bike ID
   */
  getBikeById: async (bikeId) => {
    try {
      const response = await api.get(API_ENDPOINTS.BIKES.GET_BIKE(bikeId));
      
      let bike = null;
      if (response.success === true) {
        bike = response.data;
      } else if (response.data?.success === true) {
        bike = response.data.data;
      } else if (response.data) {
        bike = response.data;
      }
      
      return { success: true, data: bike };
    } catch (error) {
      console.error('Get bike error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch bike'
      };
    }
  },

  /**
   * Add a new bike
   * @param {object} bikeData - Bike data
   */
  addBike: async (bikeData) => {
    try {
      console.log('=== ADD BIKE ===');
      console.log('Adding bike:', bikeData);
      console.log('Endpoint:', API_ENDPOINTS.BIKES.ADD_BIKE);
      
      const response = await api.post(API_ENDPOINTS.BIKES.ADD_BIKE, bikeData);
      console.log('Raw add bike response:', response);
      
      // Handle different response formats
      let success = false;
      let data = null;
      let message = 'Bike added successfully';
      
      if (response && typeof response === 'object') {
        // Format 1: { success: true, data: {...}, message: '...' }
        if (response.success === true) {
          success = true;
          data = response.data;
          message = response.message || message;
        }
        // Format 2: { data: { success: true, data: {...}, message: '...' } }
        else if (response.data?.success === true) {
          success = true;
          data = response.data.data;
          message = response.data.message || message;
        }
        // Format 3: Direct bike object returned
        else if (response.id) {
          success = true;
          data = response;
        }
        // Format 4: { data: { id: '...', ... } }
        else if (response.data?.id) {
          success = true;
          data = response.data;
        }
        // Format 5: 201 Created with no body
        else if (response.status === 201 || response.status === 200) {
          success = true;
          data = bikeData; // Use request data as fallback
        }
      }
      
      console.log('Processed add bike result:', { success, data, message });
      
      if (success) {
        return { 
          success: true, 
          data: data, 
          message: message 
        };
      } else {
        return { 
          success: false, 
          error: response?.message || response?.data?.message || 'Failed to add bike' 
        };
      }
    } catch (error) {
      console.error('=== ADD BIKE ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to add bike';
      
      if (error.response?.status === 409) {
        errorMessage = 'This registration number is already registered';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid bike data';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  /**
   * Update a bike
   * @param {string} bikeId - Bike ID
   * @param {object} bikeData - Updated bike data
   */
  updateBike: async (bikeId, bikeData) => {
    try {
      console.log('Updating bike:', bikeId, bikeData);
      const response = await api.put(API_ENDPOINTS.BIKES.UPDATE_BIKE(bikeId), bikeData);
      console.log('Update bike response:', response);
      
      let success = false;
      let data = null;
      let message = 'Bike updated successfully';
      
      if (response?.success === true) {
        success = true;
        data = response.data;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
        message = response.data.message || message;
      } else if (response?.id) {
        success = true;
        data = response;
      }
      
      return { 
        success, 
        data, 
        message 
      };
    } catch (error) {
      console.error('Update bike error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update bike' 
      };
    }
  },

  /**
   * Delete a bike
   * @param {string} bikeId - Bike ID
   */
  deleteBike: async (bikeId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.BIKES.DELETE_BIKE(bikeId));
      console.log('Delete bike response:', response);
      
      let success = false;
      let message = 'Bike deleted successfully';
      
      if (response?.success === true) {
        success = true;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        message = response.data.message || message;
      } else if (response?.status === 200 || response?.status === 204) {
        success = true;
      }
      
      return { success, message };
    } catch (error) {
      console.error('Delete bike error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete bike' 
      };
    }
  },

  /**
   * Upload bike image
   * @param {string} bikeId - Bike ID
   * @param {File} file - Image file
   */
  uploadBikeImage: async (bikeId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(
        API_ENDPOINTS.BIKES.UPLOAD_IMAGE(bikeId), 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
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
      console.error('Upload bike image error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload image' 
      };
    }
  },
// Add this method to your existing bikeService.js
getMyBikes: async () => {
  try {
    console.log('=== GET MY BIKES ===');
    const response = await api.get(API_ENDPOINTS.BIKES.GET_MY_BIKES);
    console.log('Bikes response:', response);
    
    let bikes = [];
    if (response?.success === true) {
      bikes = response.data || [];
    } else if (response?.data?.success === true) {
      bikes = response.data.data || [];
    } else if (Array.isArray(response?.data)) {
      bikes = response.data;
    } else if (Array.isArray(response)) {
      bikes = response;
    }
    
    console.log('Processed bikes:', bikes.length);
    return { success: true, data: bikes };
  } catch (error) {
    console.error('Get bikes error:', error);
    return { success: false, data: [] };
  }
},
  /**
   * Check if registration number exists
   * @param {string} registrationNumber - Registration number
   */
  checkRegistrationNumber: async (registrationNumber) => {
    try {
      const response = await api.get(`/bikes/check-registration`, {
        params: { registrationNumber }
      });
      
      let exists = false;
      if (response?.success === true) {
        exists = response.data?.exists || false;
      } else if (response?.data?.success === true) {
        exists = response.data.data?.exists || false;
      }
      
      return { success: true, exists };
    } catch (error) {
      console.error('Check registration error:', error);
      return { success: false, exists: false };
    }
  },
};

export default bikeService;
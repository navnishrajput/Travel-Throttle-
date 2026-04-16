/**
 * RIDE SERVICE
 * Ride related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const rideService = {
  /**
   * Get all rides with pagination
   */
  getAllRides: async (page = 0, size = 20) => {
    try {
      console.log('=== GET ALL RIDES ===');
      const response = await api.get(API_ENDPOINTS.RIDES.GET_ALL, { params: { page, size } });
      console.log('All rides response:', response);
      
      let rides = [];
      
      if (response?.success === true) {
        if (response.data?.content) {
          rides = response.data.content;
        } else if (Array.isArray(response.data)) {
          rides = response.data;
        }
      } else if (response?.data?.success === true) {
        if (response.data.data?.content) {
          rides = response.data.data.content;
        } else if (Array.isArray(response.data.data)) {
          rides = response.data.data;
        }
      }
      
      return { 
        success: true, 
        data: rides,
        totalElements: response?.data?.totalElements || rides.length
      };
    } catch (error) {
      console.error('Get all rides error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch rides', 
        data: [] 
      };
    }
  },

  /**
   * Get current user's rides (created and joined)
   */
  getMyRides: async () => {
    try {
      console.log('=== GET MY RIDES ===');
      const response = await api.get(API_ENDPOINTS.RIDES.MY_RIDES);
      console.log('My rides API response:', response);
      
      let rides = [];
      
      if (response?.success === true) {
        rides = response.data || [];
      } else if (response?.data?.success === true) {
        rides = response.data.data || [];
      } else if (Array.isArray(response)) {
        rides = response;
      } else if (Array.isArray(response?.data)) {
        rides = response.data;
      }
      
      console.log('Processed rides:', rides.length);
      
      return { 
        success: true, 
        data: rides 
      };
    } catch (error) {
      console.error('Get my rides error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch your rides', 
        data: [] 
      };
    }
  },

  /**
   * Get upcoming rides
   */
  getUpcomingRides: async () => {
    try {
      console.log('=== GET UPCOMING RIDES ===');
      const response = await api.get(API_ENDPOINTS.RIDES.UPCOMING);
      console.log('Upcoming rides response:', response);
      
      let rides = [];
      
      if (response?.success === true) {
        rides = response.data || [];
      } else if (response?.data?.success === true) {
        rides = response.data.data || [];
      } else if (Array.isArray(response)) {
        rides = response;
      }
      
      return { 
        success: true, 
        data: rides 
      };
    } catch (error) {
      console.error('Get upcoming rides error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upcoming rides', 
        data: [] 
      };
    }
  },

  /**
   * Get ride by ID
   */
  getRideById: async (rideId) => {
    try {
      console.log('=== GET RIDE BY ID ===', rideId);
      const response = await api.get(API_ENDPOINTS.RIDES.GET_BY_ID(rideId));
      console.log('Ride by ID response:', response);
      
      let ride = null;
      
      if (response?.success === true) {
        ride = response.data;
      } else if (response?.data?.success === true) {
        ride = response.data.data;
      } else if (response?.data) {
        ride = response.data;
      } else if (response?.id) {
        ride = response;
      }
      
      return { 
        success: true, 
        data: ride 
      };
    } catch (error) {
      console.error('Get ride by ID error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch ride details',
        data: null
      };
    }
  },

  /**
   * Create a new ride
   */
  createRide: async (rideData) => {
    try {
      console.log('=== CREATE RIDE ===');
      console.log('Ride data:', rideData);
      
      const response = await api.post(API_ENDPOINTS.RIDES.CREATE, rideData);
      console.log('Create ride response:', response);
      
      let success = false;
      let data = null;
      let message = 'Ride created successfully';
      
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
      console.error('Create ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create ride'
      };
    }
  },

  /**
   * Update a ride
   */
  updateRide: async (rideId, rideData) => {
    try {
      console.log('=== UPDATE RIDE ===', rideId);
      const response = await api.put(API_ENDPOINTS.RIDES.UPDATE(rideId), rideData);
      console.log('Update ride response:', response);
      
      let success = false;
      let data = null;
      let message = 'Ride updated successfully';
      
      if (response?.success === true) {
        success = true;
        data = response.data;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
        message = response.data.message || message;
      }
      
      return { 
        success, 
        data, 
        message 
      };
    } catch (error) {
      console.error('Update ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update ride' 
      };
    }
  },

  /**
   * Cancel a ride
   */
  cancelRide: async (rideId) => {
    try {
      console.log('=== CANCEL RIDE ===', rideId);
      const response = await api.put(API_ENDPOINTS.RIDES.CANCEL(rideId));
      console.log('Cancel ride response:', response);
      
      let success = false;
      let message = 'Ride cancelled successfully';
      
      if (response?.success === true) {
        success = true;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        message = response.data.message || message;
      }
      
      return { 
        success, 
        message 
      };
    } catch (error) {
      console.error('Cancel ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel ride' 
      };
    }
  },

  /**
   * Delete a ride
   */
  deleteRide: async (rideId) => {
    try {
      console.log('=== DELETE RIDE ===', rideId);
      const response = await api.delete(API_ENDPOINTS.RIDES.DELETE(rideId));
      console.log('Delete ride response:', response);
      
      let success = false;
      let message = 'Ride deleted successfully';
      
      if (response?.success === true) {
        success = true;
        message = response.message || message;
      } else if (response?.data?.success === true) {
        success = true;
        message = response.data.message || message;
      } else if (response?.status === 200 || response?.status === 204) {
        success = true;
      }
      
      return { 
        success, 
        message 
      };
    } catch (error) {
      console.error('Delete ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete ride' 
      };
    }
  },

  /**
   * Search rides with filters
   */
  searchRides: async (filters) => {
    try {
      console.log('=== SEARCH RIDES SERVICE ===');
      console.log('Filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minSeats) params.append('minSeats', filters.minSeats);
      
      const url = `${API_ENDPOINTS.RIDES.SEARCH}?${params.toString()}`;
      console.log('Search URL:', url);
      
      const response = await api.get(url);
      console.log('Search API raw response:', response);
      
      let rides = [];
      
      // Handle ALL possible response structures
      if (response?.success === true) {
        if (response.data?.content) {
          rides = response.data.content;
        } else if (Array.isArray(response.data)) {
          rides = response.data;
        } else if (response.data) {
          rides = [response.data];
        }
      } else if (response?.data?.success === true) {
        if (response.data.data?.content) {
          rides = response.data.data.content;
        } else if (Array.isArray(response.data.data)) {
          rides = response.data.data;
        }
      } else if (response?.content) {
        rides = response.content;
      } else if (Array.isArray(response)) {
        rides = response;
      } else if (response?.data?.content) {
        rides = response.data.content;
      } else if (Array.isArray(response?.data)) {
        rides = response.data;
      }
      
      console.log('Processed rides:', rides.length);
      
      return { 
        success: true, 
        data: rides 
      };
    } catch (error) {
      console.error('Search rides error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to search rides', 
        data: [] 
      };
    }
  },

  /**
   * Start a ride (owner only)
   */
  startRide: async (rideId) => {
    try {
      console.log('=== START RIDE ===', rideId);
      const response = await api.put(`/rides/${rideId}/start`);
      console.log('Start ride response:', response);
      
      let success = false;
      
      if (response?.success === true) {
        success = true;
      } else if (response?.data?.success === true) {
        success = true;
      }
      
      return { success };
    } catch (error) {
      console.error('Start ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to start ride' 
      };
    }
  },

  /**
   * Complete a ride (owner only)
   */
  completeRide: async (rideId) => {
    try {
      console.log('=== COMPLETE RIDE ===', rideId);
      const response = await api.put(`/rides/${rideId}/complete`);
      console.log('Complete ride response:', response);
      
      let success = false;
      
      if (response?.success === true) {
        success = true;
      } else if (response?.data?.success === true) {
        success = true;
      }
      
      return { success };
    } catch (error) {
      console.error('Complete ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to complete ride' 
      };
    }
  },

  /**
   * Get user's bikes (for ride creation)
   */
  getUserBikes: async () => {
    try {
      console.log('=== GET USER BIKES ===');
      const response = await api.get('/bikes/my-bikes');
      console.log('User bikes response:', response);
      
      let bikes = [];
      
      if (response?.success === true) {
        bikes = response.data || [];
      } else if (response?.data?.success === true) {
        bikes = response.data.data || [];
      } else if (Array.isArray(response?.data)) {
        bikes = response.data;
      }
      
      return { 
        success: true, 
        data: bikes 
      };
    } catch (error) {
      console.error('Get user bikes error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch bikes', 
        data: [] 
      };
    }
  },

  /**
   * Check if user can join a ride
   */
  canJoinRide: async (rideId) => {
    try {
      const response = await api.get(`/rides/${rideId}/can-join`);
      
      let canJoin = false;
      
      if (response?.success === true) {
        canJoin = response.data?.canJoin || false;
      } else if (response?.data?.success === true) {
        canJoin = response.data.data?.canJoin || false;
      }
      
      return { success: true, canJoin };
    } catch (error) {
      console.error('Can join ride error:', error);
      return { success: false, canJoin: false };
    }
  },

  /**
   * Get ride participants
   */
  getRideParticipants: async (rideId) => {
    try {
      console.log('=== GET RIDE PARTICIPANTS ===', rideId);
      const response = await api.get(`/rides/${rideId}/participants`);
      console.log('Participants response:', response);
      
      let participants = [];
      
      if (response?.success === true) {
        participants = response.data || [];
      } else if (response?.data?.success === true) {
        participants = response.data.data || [];
      } else if (Array.isArray(response?.data)) {
        participants = response.data;
      }
      
      return { 
        success: true, 
        data: participants 
      };
    } catch (error) {
      console.error('Get participants error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch participants', 
        data: [] 
      };
    }
  },
};

export default rideService;
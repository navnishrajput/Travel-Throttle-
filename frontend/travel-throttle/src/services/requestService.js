/**
 * REQUEST SERVICE
 * Ride join request related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../constants';

export const requestService = {
  /**
   * Send a request to join a ride
   * @param {string} rideId - Ride ID
   * @param {string} message - Optional message
   * @param {number} seatsRequested - Number of seats
   */
  sendRequest: async (rideId, message = '', seatsRequested = 1) => {
    try {
      console.log('=== SEND REQUEST ===', { rideId, message, seatsRequested });
      
      const response = await api.post(API_ENDPOINTS.REQUESTS.SEND, {
        rideId,
        message: message || '',
        seatsRequested: seatsRequested || 1
      });
      
      console.log('Send request response:', response);
      
      let success = false;
      let data = null;
      let errorMessage = 'Failed to send request';
      
      if (response?.success === true) {
        success = true;
        data = response.data;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
      } else if (response?.id) {
        success = true;
        data = response;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error || errorMessage;
      } else if (response?.data?.success === false) {
        errorMessage = response.data.message || response.data.error || errorMessage;
      }
      
      return { 
        success, 
        data, 
        message: response?.message,
        error: success ? null : errorMessage 
      };
      
    } catch (error) {
      console.error('Send request error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to send request';
      
      if (error.response?.status === 409) {
        errorMessage = 'You have already requested to join this ride';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid request';
      } else if (error.response?.status === 403) {
        errorMessage = 'You cannot join your own ride';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Get all requests made by the current user
   */
  getMyRequests: async () => {
    try {
      console.log('=== GET MY REQUESTS ===');
      const response = await api.get(API_ENDPOINTS.REQUESTS.GET_MY_REQUESTS);
      console.log('My requests response:', response);
      
      let requests = [];
      let success = false;
      let errorMessage = null;
      
      if (response?.success === true) {
        success = true;
        requests = response.data || [];
      } else if (response?.data?.success === true) {
        success = true;
        requests = response.data.data || [];
      } else if (Array.isArray(response)) {
        success = true;
        requests = response;
      } else if (Array.isArray(response?.data)) {
        success = true;
        requests = response.data;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error;
      }
      
      return { 
        success, 
        data: requests,
        error: errorMessage
      };
      
    } catch (error) {
      console.error('Get my requests error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch requests', 
        data: [] 
      };
    }
  },

  /**
   * Get all requests for a specific ride (owner only)
   * @param {string} rideId - Ride ID
   */
  getRequestsByRide: async (rideId) => {
    try {
      console.log('=== GET REQUESTS BY RIDE ===', rideId);
      const response = await api.get(API_ENDPOINTS.REQUESTS.GET_FOR_RIDE(rideId));
      console.log('Requests by ride response:', response);
      
      let requests = [];
      let success = false;
      let errorMessage = null;
      
      if (response?.success === true) {
        success = true;
        requests = response.data || [];
      } else if (response?.data?.success === true) {
        success = true;
        requests = response.data.data || [];
      } else if (Array.isArray(response)) {
        success = true;
        requests = response;
      } else if (Array.isArray(response?.data)) {
        success = true;
        requests = response.data;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error;
      }
      
      return { 
        success, 
        data: requests,
        error: errorMessage
      };
      
    } catch (error) {
      console.error('Get requests by ride error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch requests', 
        data: [] 
      };
    }
  },

  /**
   * Approve a join request (ride owner only)
   * @param {string} requestId - Request ID
   */
  approveRequest: async (requestId) => {
    try {
      console.log('=== APPROVE REQUEST ===', requestId);
      const response = await api.put(API_ENDPOINTS.REQUESTS.APPROVE(requestId));
      console.log('Approve response:', response);
      
      let success = false;
      let data = null;
      let errorMessage = null;
      
      if (response?.success === true) {
        success = true;
        data = response.data;
      } else if (response?.data?.success === true) {
        success = true;
        data = response.data.data;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error;
      } else if (response?.data?.success === false) {
        errorMessage = response.data.message || response.data.error;
      }
      
      return { 
        success, 
        data, 
        message: response?.message,
        error: errorMessage 
      };
      
    } catch (error) {
      console.error('Approve request error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to approve request';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  /**
   * Reject a join request (ride owner only)
   * @param {string} requestId - Request ID
   */
  rejectRequest: async (requestId) => {
    try {
      console.log('=== REJECT REQUEST ===', requestId);
      const response = await api.put(API_ENDPOINTS.REQUESTS.REJECT(requestId));
      console.log('Reject response:', response);
      
      let success = false;
      let errorMessage = null;
      
      if (response?.success === true) {
        success = true;
      } else if (response?.data?.success === true) {
        success = true;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error;
      } else if (response?.data?.success === false) {
        errorMessage = response.data.message || response.data.error;
      }
      
      return { 
        success, 
        message: response?.message,
        error: errorMessage 
      };
      
    } catch (error) {
      console.error('Reject request error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to reject request' 
      };
    }
  },

  /**
   * Cancel a request (requester only)
   * @param {string} requestId - Request ID
   */
  cancelRequest: async (requestId) => {
    try {
      console.log('=== CANCEL REQUEST ===', requestId);
      const response = await api.put(API_ENDPOINTS.REQUESTS.CANCEL(requestId));
      console.log('Cancel response:', response);
      
      let success = false;
      let errorMessage = null;
      
      if (response?.success === true) {
        success = true;
      } else if (response?.data?.success === true) {
        success = true;
      } else if (response?.success === false) {
        errorMessage = response.message || response.error;
      } else if (response?.data?.success === false) {
        errorMessage = response.data.message || response.data.error;
      }
      
      return { 
        success, 
        message: response?.message,
        error: errorMessage 
      };
      
    } catch (error) {
      console.error('Cancel request error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to cancel request' 
      };
    }
  },

  /**
   * Check if user has already requested a ride
   * @param {string} rideId - Ride ID
   */
  hasRequested: async (rideId) => {
    try {
      const response = await requestService.getMyRequests();
      if (response.success) {
        const hasRequest = response.data.some(req => req.ride?.id === rideId);
        return { success: true, hasRequested: hasRequest };
      }
      return { success: false, hasRequested: false };
    } catch (error) {
      return { success: false, hasRequested: false };
    }
  },

  /**
   * Get request status for a specific ride
   * @param {string} rideId - Ride ID
   */
  getRequestStatus: async (rideId) => {
    try {
      const response = await requestService.getMyRequests();
      if (response.success) {
        const request = response.data.find(req => req.ride?.id === rideId);
        return { 
          success: true, 
          hasRequested: !!request, 
          status: request?.status,
          requestId: request?.id
        };
      }
      return { success: false, hasRequested: false, status: null };
    } catch (error) {
      return { success: false, hasRequested: false, status: null };
    }
  },
};

export default requestService;
/**
 * PUBLIC RIDE SERVICE
 * Public ride API calls (no authentication required)
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create a public axios instance without auth headers
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Log all requests for debugging
publicApi.interceptors.request.use(
  (config) => {
    console.log(`PUBLIC API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Public API Request error:', error);
    return Promise.reject(error);
  }
);

// Log all responses for debugging
publicApi.interceptors.response.use(
  (response) => {
    console.log(`PUBLIC API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('PUBLIC API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const publicRideService = {
  /**
   * Get all upcoming rides (public)
   */
  getAllUpcomingRides: async () => {
    try {
      console.log('=== PUBLIC: Get All Upcoming Rides ===');
      const response = await publicApi.get('/public/rides/upcoming');
      console.log('Public upcoming rides response:', response.data);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data || [] };
      }
      return { success: false, data: [], error: response.data?.message };
    } catch (error) {
      console.error('Public get upcoming rides error:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * Search rides (public)
   */
  searchRides: async (filters) => {
    try {
      console.log('=== PUBLIC: Search Rides ===');
      console.log('Filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.date) params.append('date', filters.date);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minSeats) params.append('minSeats', filters.minSeats);
      
      const url = `/public/rides/search?${params.toString()}`;
      console.log('Search URL:', url);
      
      const response = await publicApi.get(url);
      console.log('Public search response:', response.data);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data || [] };
      }
      return { success: false, data: [], error: response.data?.message };
    } catch (error) {
      console.error('Public search rides error:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * Get ride by ID (public)
   */
  getRideById: async (rideId) => {
    try {
      console.log('=== PUBLIC: Get Ride By ID ===', rideId);
      const response = await publicApi.get(`/public/rides/${rideId}`);
      console.log('Public ride response:', response.data);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      }
      return { success: false, data: null, error: response.data?.message };
    } catch (error) {
      console.error('Public get ride by ID error:', error);
      return { success: false, data: null, error: error.message };
    }
  },
};

export default publicRideService;
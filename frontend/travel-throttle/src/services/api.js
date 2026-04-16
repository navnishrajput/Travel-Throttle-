/**
 * API SERVICE
 * Axios instance with interceptors for authentication
 */

import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL || 'http://localhost:8080/api',
  timeout: API_CONFIG.timeout || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request start time for timeout tracking
    config.metadata = { startTime: new Date().getTime() };
    
    // Don't log in production
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Don't log in production
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    
    // Return the data in the expected format
    if (response.data) {
      return response.data;
    }
    
    return { success: true, data: response.data };
  },
  (error) => {
    // Handle aborted/cancelled requests gracefully
    if (axios.isCancel(error) || error.code === 'ECONNABORTED' || error.message === 'Request aborted') {
      console.warn('Request was aborted or timed out:', error.config?.url);
      return Promise.resolve({
        success: false,
        status: 0,
        message: 'Request timed out. Please try again.',
        data: null,
        error: 'Request aborted'
      });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error - Cannot connect to server');
      return Promise.resolve({
        success: false,
        status: 0,
        message: 'Cannot connect to server. Please check if backend is running.',
        data: null,
        error: 'Network Error'
      });
    }
    
    console.error('=== API ERROR ===');
    console.error('URL:', error.config?.url);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Unauthorized - Token may be expired');
      
      // Clear invalid token
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    // Return a consistent error format
    return Promise.resolve({
      success: false,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'An error occurred',
      data: null,
      error: error.response?.data || error.message
    });
  }
);

// Helper methods
api.isTokenValid = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() < expiry;
  } catch {
    return false;
  }
};

api.clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem('tt_refresh_token');
  localStorage.removeItem('tt_remember_me');
};

api.setToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

api.getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

api.isAuthenticated = () => {
  return api.isTokenValid();
};

export default api;
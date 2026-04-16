/**
 * AUTH SERVICE
 * Authentication related API calls with proper token storage
 */

import api from './api';
import { STORAGE_KEYS } from '../constants';

// Helper function to get token expiry time
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 - Date.now();
  } catch {
    return 0;
  }
}

export const authService = {
  login: async (email, password) => {
    try {
      console.log('=== AUTH SERVICE LOGIN ===');
      console.log('Email:', email);
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080/api');
      
      const response = await api.post('/auth/login', { 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      console.log('Login response:', response);
      
      if (response.success) {
        const { token, refreshToken, ...userData } = response.data;
        
        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem('tt_refresh_token', refreshToken);
        }
        
        console.log('Token stored successfully');
        console.log('Token expires in:', getTokenExpiry(token), 'ms');
        
        return { success: true, data: { ...userData, token } };
      }
      
      return { success: false, error: response.message || 'Login failed' };
      
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Is the backend running?';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  signup: async (userData) => {
    try {
      console.log('=== AUTH SERVICE SIGNUP ===');
      console.log('User data:', { ...userData, password: '***' });
      
      const response = await api.post('/auth/signup', {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        phone: userData.phone.replace(/\D/g, ''),
        password: userData.password,
        hasBike: userData.hasBike,
        acceptTerms: userData.acceptTerms || true
      });
      
      console.log('Signup response:', response);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Account created successfully!'
        };
      }
      
      return {
        success: false,
        error: response.message || 'Signup failed'
      };
      
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response?.status === 409) {
        errorMessage = error.response?.data?.message || 'This email or phone number is already registered.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid request. Please check your information.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Is the backend running?';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  googleLogin: async (credential) => {
    try {
      console.log('=== GOOGLE LOGIN ===');
      
      const response = await api.post('/auth/oauth2/google', { credential });
      
      if (response.success) {
        const { token, refreshToken, ...userData } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem('tt_refresh_token', refreshToken);
        }
        localStorage.setItem('tt_remember_me', 'true');
        
        return { success: true, data: { ...userData, token } };
      }
      
      return { success: false, error: response.message || 'Google login failed' };
      
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed' 
      };
    }
  },

  phoneLogin: async (phone, password) => {
    try {
      console.log('=== PHONE LOGIN ===');
      console.log('Phone:', phone);
      
      const response = await api.post('/auth/phone-login', { 
        phone: phone.replace(/\D/g, ''), 
        password 
      });
      
      console.log('Phone login response:', response);
      
      if (response.success) {
        const { token, refreshToken, ...userData } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem('tt_refresh_token', refreshToken);
        }
        
        console.log('Token stored successfully');
        
        return { success: true, data: { ...userData, token } };
      }
      
      return { success: false, error: response.message || 'Login failed' };
      
    } catch (error) {
      console.error('Phone login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid phone or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Is the backend running?';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  sendOTP: async (phone) => {
    try {
      console.log('=== SEND OTP ===');
      console.log('Phone:', phone);
      
      const response = await api.post('/auth/send-otp', { 
        phone: phone.replace(/\D/g, '') 
      });
      
      if (response.success) {
        return { success: true, message: response.message || 'OTP sent successfully' };
      }
      
      return { success: false, error: response.message || 'Failed to send OTP' };
      
    } catch (error) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send OTP' 
      };
    }
  },

  verifyOTP: async (phone, otp) => {
    try {
      console.log('=== VERIFY OTP ===');
      
      const response = await api.post('/auth/verify-otp', { 
        phone: phone.replace(/\D/g, ''), 
        otp 
      });
      
      if (response.success) {
        const { token, refreshToken, ...userData } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem('tt_refresh_token', refreshToken);
        }
        localStorage.setItem('tt_remember_me', 'true');
        
        return { success: true, data: { ...userData, token } };
      }
      
      return { success: false, error: response.message || 'Invalid OTP' };
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid OTP' 
      };
    }
  },

  logout: () => {
    console.log('=== AUTH SERVICE LOGOUT ===');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('tt_refresh_token');
    localStorage.removeItem('tt_remember_me');
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('tt_refresh_token');
      if (!refreshToken) return { success: false };
      
      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.success) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },
};

export default authService;
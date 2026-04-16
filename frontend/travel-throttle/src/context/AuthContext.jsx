/**
 * AUTH CONTEXT
 * Global authentication state management with persistent login
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  const loadUserFromStorage = useCallback(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const rememberMe = localStorage.getItem('tt_remember_me');

      console.log('=== LOADING USER FROM STORAGE ===');
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);
      console.log('Remember me:', rememberMe);

      if (token && userData && isTokenValid(token)) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User restored:', parsedUser.email);
        return true;
      } else {
        // Clear invalid data
        if (token && !isTokenValid(token)) {
          console.log('Token expired, clearing storage');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
        return false;
      }
    } catch (e) {
      console.error('Failed to load user from storage:', e);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return false;
    }
  }, [isTokenValid]);

  useEffect(() => {
    loadUserFromStorage();
    setLoading(false);
  }, [loadUserFromStorage]);

  const login = async (email, password, rememberMe = true) => {
    console.log('=== LOGIN ATTEMPT ===');
    
    setLoading(true);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        const userData = result.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Always store remember me preference
        localStorage.setItem('tt_remember_me', rememberMe ? 'true' : 'false');
        
        console.log('Login successful, user stored:', userData.email);
        return { success: true, data: userData };
      } else {
        console.error('Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    console.log('=== SIGNUP ATTEMPT ===');
    
    setLoading(true);
    
    try {
      const result = await authService.signup(userData);
      
      if (result.success) {
        console.log('Signup successful for:', userData.email);
        return { success: true, data: result.data, message: result.message };
      } else {
        console.error('Signup failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    console.log('=== GOOGLE LOGIN ATTEMPT ===');
    
    setLoading(true);
    
    try {
      const result = await authService.googleLogin(credential);
      
      if (result.success) {
        const userData = result.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('tt_remember_me', 'true');
        console.log('Google login successful:', userData.email);
        return { success: true, data: userData };
      } else {
        console.error('Google login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== LOGOUT ===');
    
    setLoading(true);
    
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('tt_remember_me');
    localStorage.removeItem('tt_refresh_token');
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('User logged out');
    setLoading(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    googleLogin,
    logout,
    reloadUser: loadUserFromStorage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
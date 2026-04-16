/**
 * APPLICATION CONFIGURATION
 * All app-level constants with unique IDs
 */

export const APP_CONFIG = {
  id: 'app-config',
  name: 'Travel Throttle',
  version: '1.0.0',
  description: 'Ride together, reduce cost, build community',
  author: 'Travel Throttle Team',
  year: new Date().getFullYear(),
  
  features: {
    id: 'features',
    chat: true,
    reviews: true,
    payments: false,
    locationTracking: false,
    emergencySOS: true,
  },
  
  limits: {
    id: 'app-limits',
    maxSeatsPerRide: 4,
    maxBikesPerUser: 5,
    maxMessageLength: 500,
    minRideCost: 0,
    maxRideCost: 10000,
  },
  
  pagination: {
    id: 'pagination',
    defaultLimit: 10,
    maxLimit: 50,
  }
};

export const API_CONFIG = {
  id: 'api-config',
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  version: 'v1',
  
  statusCodes: {
    id: 'status-codes',
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
  }
};

export const STORAGE_KEYS = {
  id: 'storage-keys',
  AUTH_TOKEN: 'tt_auth_token',
  USER_DATA: 'tt_user_data',
  THEME: 'tt_theme',
  RECENT_SEARCHES: 'tt_recent_searches',
  REMEMBER_ME: 'tt_remember_me',
};
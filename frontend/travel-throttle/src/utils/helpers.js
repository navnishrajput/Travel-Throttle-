/**
 * HELPER UTILITIES
 * General helper functions with re-exports for convenience
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class name merger (Tailwind CSS)
 */
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

/**
 * Get value from nested object safely
 */
export const get = (obj, path, defaultValue = undefined) => {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

/**
 * Local storage helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Copy failed:', error);
    return { success: false, error };
  }
};

/**
 * Download file
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Estimate travel time based on distance
 */
export const estimateTravelTime = (distanceKm, avgSpeedKmh = 50) => {
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.round(hours * 60);
  return minutes;
};

/**
 * Calculate cost split
 */
export const calculateCostSplit = (totalCost, numberOfPeople) => {
  if (!numberOfPeople || numberOfPeople <= 0) return totalCost;
  return Math.ceil(totalCost / numberOfPeople);
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry async function
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Check if running in development
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Check if running in production
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

/**
 * Get environment variable
 */
export const getEnv = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

/**
 * Handle API error
 */
export const handleApiError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred',
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
    };
  } else {
    return {
      status: 500,
      message: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get random item from array
 */
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================
// FORMATTERS
// ============================================

/**
 * Date Formatters
 */
export const formatDate = {
  id: 'format-date',
  
  full: (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  },
  
  short: (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  },
  
  time: (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Date';
    }
  },
  
  dateTime: (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Invalid Date';
    }
  },
  
  relative: (date) => {
    if (!date) return 'N/A';
    try {
      const now = new Date();
      const then = new Date(date);
      const diffMs = now - then;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);
      
      if (diffSec < 60) return 'just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHr < 24) return `${diffHr} hr ago`;
      if (diffDay < 7) return `${diffDay} days ago`;
      if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
      if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`;
      return `${Math.floor(diffDay / 365)} years ago`;
    } catch {
      return 'Unknown';
    }
  },
  
  iso: (date) => {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return '';
    }
  },
  
  forInput: (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  },
};

/**
 * Currency Formatters
 */
export const formatCurrency = {
  id: 'format-currency',
  
  standard: (amount, showSymbol = true) => {
    if (amount === null || amount === undefined) return 'N/A';
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return showSymbol ? `₹${formatted}` : formatted;
  },
  
  compact: (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  },
  
  parse: (value) => {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  },
};

/**
 * Number Formatters
 */
export const formatNumber = {
  id: 'format-number',
  
  withCommas: (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  },
  
  compact: (num) => {
    if (num === null || num === undefined) return '0';
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },
  
  decimal: (num, places = 2) => {
    if (num === null || num === undefined) return '0.00';
    return num.toFixed(places);
  },
  
  percentage: (num) => {
    if (num === null || num === undefined) return '0%';
    return `${Math.round(num * 100)}%`;
  },
};

/**
 * Distance Formatters
 */
export const formatDistanceDisplay = {
  id: 'format-distance-display',
  
  km: (km) => {
    if (km === null || km === undefined) return 'N/A';
    return `${Math.round(km)} km`;
  },
  
  kmWithDecimal: (km) => {
    if (km === null || km === undefined) return 'N/A';
    return `${km.toFixed(1)} km`;
  },
};

export const formatDistance = formatDistanceDisplay;

/**
 * Duration Formatters
 */
export const formatDuration = {
  id: 'format-duration',
  
  fromMinutes: (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  },
  
  fromHours: (hours) => {
    if (hours === null || hours === undefined) return 'N/A';
    return formatDuration.fromMinutes(hours * 60);
  },
};

/**
 * Name Formatters
 */
export const formatName = {
  id: 'format-name',
  
  initials: (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },
  
  truncate: (name, maxLength = 20) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength - 3)}...`;
  },
  
  capitalize: (text) => {
    if (!text) return '';
    return text.replace(/\b\w/g, char => char.toUpperCase());
  },
};

/**
 * Text Formatters
 */
export const formatText = {
  id: 'format-text',
  
  truncate: (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  },
  
  titleCase: (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },
  
  slugify: (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  },
  
  stripHtml: (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  },
};

/**
 * Rating Formatter
 */
export const formatRating = {
  id: 'format-rating',
  
  display: (rating) => {
    if (rating === null || rating === undefined) return '0.0';
    return rating.toFixed(1);
  },
  
  withStar: (rating) => {
    if (rating === null || rating === undefined) return '★ 0.0';
    return `★ ${rating.toFixed(1)}`;
  },
};

// Re-export validators
export {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateRequired,
  validateNumber,
  validateForm,
} from './validators';

// Default export
export default {
  cn,
  debounce,
  throttle,
  generateId,
  deepClone,
  isEmpty,
  groupBy,
  sortBy,
  get,
  storage,
  copyToClipboard,
  downloadFile,
  calculateDistance,
  estimateTravelTime,
  calculateCostSplit,
  sleep,
  retry,
  isDevelopment,
  isProduction,
  getEnv,
  handleApiError,
  truncateText,
  getInitials,
  getRandomItem,
  shuffleArray,
  formatDate,
  formatCurrency,
  formatNumber,
  formatDistance,
  formatDuration,
  formatName,
  formatText,
  formatRating,
};
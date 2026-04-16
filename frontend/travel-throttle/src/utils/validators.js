/**
 * VALIDATOR UTILITIES
 * Form and data validation functions
 */

import { REGEX_PATTERNS } from './constants';
import { VALIDATION_MESSAGES } from '../constants/formConstants';

/**
 * Email validation
 */
export const validateEmail = {
  id: 'validate-email',
  
  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValid: (email) => {
    if (!email) return false;
    return REGEX_PATTERNS.EMAIL.test(email);
  },
  
  /**
   * Validate email and return error message
   * @param {string} email - Email to validate
   * @returns {string|null} Error message or null
   */
  validate: (email) => {
    if (!email) return VALIDATION_MESSAGES.required('Email');
    if (!REGEX_PATTERNS.EMAIL.test(email)) return VALIDATION_MESSAGES.email;
    return null;
  },
};

/**
 * Password validation
 */
export const validatePassword = {
  id: 'validate-password',
  
  /**
   * Check if password meets requirements
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   */
  isValid: (password) => {
    if (!password) return false;
    return password.length >= 8 && REGEX_PATTERNS.PASSWORD.test(password);
  },
  
  /**
   * Validate password and return error message
   * @param {string} password - Password to validate
   * @returns {string|null} Error message or null
   */
  validate: (password) => {
    if (!password) return VALIDATION_MESSAGES.required('Password');
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!REGEX_PATTERNS.PASSWORD.test(password)) return VALIDATION_MESSAGES.password;
    return null;
  },
  
  /**
   * Check password strength
   * @param {string} password - Password to check
   * @returns {object} Strength info { score, label, color }
   */
  getStrength: (password) => {
    if (!password) return { score: 0, label: 'None', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
      { score: 0, label: 'Very Weak', color: 'error' },
      { score: 1, label: 'Weak', color: 'error' },
      { score: 2, label: 'Fair', color: 'warning' },
      { score: 3, label: 'Good', color: 'info' },
      { score: 4, label: 'Strong', color: 'success' },
      { score: 5, label: 'Very Strong', color: 'success' },
    ];
    
    const normalizedScore = Math.min(Math.floor(score / 1.2), 5);
    return strengths[normalizedScore];
  },
};

/**
 * Phone validation
 */
export const validatePhone = {
  id: 'validate-phone',
  
  /**
   * Check if phone number is valid
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  isValid: (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  },
  
  /**
   * Validate phone and return error message
   * @param {string} phone - Phone to validate
   * @returns {string|null} Error message or null
   */
  validate: (phone) => {
    if (!phone) return VALIDATION_MESSAGES.required('Phone number');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return VALIDATION_MESSAGES.phone;
    return null;
  },
  
  /**
   * Format phone number for display
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone
   */
  format: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },
};

/**
 * Name validation
 */
export const validateName = {
  id: 'validate-name',
  
  /**
   * Check if name is valid
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid
   */
  isValid: (name) => {
    if (!name) return false;
    return name.trim().length >= 2 && name.trim().length <= 50;
  },
  
  /**
   * Validate name and return error message
   * @param {string} name - Name to validate
   * @returns {string|null} Error message or null
   */
  validate: (name) => {
    if (!name || !name.trim()) return VALIDATION_MESSAGES.required('Name');
    if (name.trim().length < 2) return VALIDATION_MESSAGES.minLength('Name', 2);
    if (name.trim().length > 50) return VALIDATION_MESSAGES.maxLength('Name', 50);
    return null;
  },
};

/**
 * Required field validation
 */
export const validateRequired = {
  id: 'validate-required',
  
  /**
   * Check if value is present
   * @param {any} value - Value to check
   * @returns {boolean} True if present
   */
  isValid: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  
  /**
   * Validate required field and return error message
   * @param {any} value - Value to validate
   * @param {string} fieldName - Field name for error message
   * @returns {string|null} Error message or null
   */
  validate: (value, fieldName = 'Field') => {
    if (!validateRequired.isValid(value)) {
      return VALIDATION_MESSAGES.required(fieldName);
    }
    return null;
  },
};

/**
 * Number validation
 */
export const validateNumber = {
  id: 'validate-number',
  
  /**
   * Check if number is within range
   * @param {number} value - Number to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} True if valid
   */
  isInRange: (value, min, max) => {
    if (value === null || value === undefined) return false;
    return value >= min && value <= max;
  },
  
  /**
   * Validate number and return error message
   * @param {number} value - Number to validate
   * @param {object} options - Validation options
   * @returns {string|null} Error message or null
   */
  validate: (value, options = {}) => {
    const { min, max, fieldName = 'Value', required = true } = options;
    
    if (required && (value === null || value === undefined || value === '')) {
      return VALIDATION_MESSAGES.required(fieldName);
    }
    
    if (value !== null && value !== undefined && value !== '') {
      const num = Number(value);
      if (isNaN(num)) return `${fieldName} must be a number`;
      if (min !== undefined && num < min) return VALIDATION_MESSAGES.min(fieldName, min);
      if (max !== undefined && num > max) return VALIDATION_MESSAGES.max(fieldName, max);
    }
    
    return null;
  },
};

/**
 * Form validation helper
 */
export const validateForm = {
  id: 'validate-form',
  
  /**
   * Validate entire form and return errors
   * @param {object} values - Form values
   * @param {object} rules - Validation rules
   * @returns {object} Error object
   */
  validate: (values, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = values[field];
      const fieldRules = rules[field];
      
      // Required check
      if (fieldRules.required && !validateRequired.isValid(value)) {
        errors[field] = VALIDATION_MESSAGES.required(fieldRules.label || field);
        return;
      }
      
      // Skip other validations if empty and not required
      if (!validateRequired.isValid(value) && !fieldRules.required) {
        return;
      }
      
      // Type-specific validations
      if (fieldRules.type === 'email') {
        const error = validateEmail.validate(value);
        if (error) errors[field] = error;
      } else if (fieldRules.type === 'password') {
        const error = validatePassword.validate(value);
        if (error) errors[field] = error;
      } else if (fieldRules.type === 'phone') {
        const error = validatePhone.validate(value);
        if (error) errors[field] = error;
      } else if (fieldRules.type === 'name') {
        const error = validateName.validate(value);
        if (error) errors[field] = error;
      }
      
      // Custom validation
      if (fieldRules.validate && !errors[field]) {
        const error = fieldRules.validate(value, values);
        if (error) errors[field] = error;
      }
      
      // Match field
      if (fieldRules.match && value !== values[fieldRules.match]) {
        errors[field] = fieldRules.matchMessage || 'Fields do not match';
      }
    });
    
    return errors;
  },
  
  /**
   * Check if form has any errors
   * @param {object} errors - Error object
   * @returns {boolean} True if has errors
   */
  hasErrors: (errors) => {
    return Object.keys(errors).length > 0;
  },
};

// Default export
export default {
  email: validateEmail,
  password: validatePassword,
  phone: validatePhone,
  name: validateName,
  required: validateRequired,
  number: validateNumber,
  form: validateForm,
};
/**
 * FORM CONSTANTS
 */

export const FORM_FIELDS = {
  LOGIN: {
    fields: [
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true },
    ],
  },
  SIGNUP: {
    fields: [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true },
    ],
  },
};

export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email address',
  },
  PHONE: {
    pattern: /^[0-9]{10}$/,
    message: 'Invalid phone number',
  },
  PASSWORD: {
    minLength: 8,
    message: 'Password must be at least 8 characters',
  },
};

export const VALIDATION_MESSAGES = {
  required: (field) => `${field} is required`,
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters',
  passwordMatch: 'Passwords do not match',
};
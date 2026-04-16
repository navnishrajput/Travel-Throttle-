/**
 * UTILITY CONSTANTS
 * Helper constants used across utility functions
 */

export const TIME_CONSTANTS = {
  id: 'time-constants',
  SECONDS_IN_MINUTE: 60,
  SECONDS_IN_HOUR: 3600,
  SECONDS_IN_DAY: 86400,
  MILLISECONDS_IN_SECOND: 1000,
  MILLISECONDS_IN_MINUTE: 60000,
  MILLISECONDS_IN_HOUR: 3600000,
  MILLISECONDS_IN_DAY: 86400000,
};

export const DATE_FORMATS = {
  id: 'date-formats',
  FULL_DATE: 'MMMM dd, yyyy',
  SHORT_DATE: 'MMM dd, yyyy',
  TIME_ONLY: 'hh:mm a',
  DATE_TIME: 'MMM dd, yyyy hh:mm a',
  ISO_DATE: 'yyyy-MM-dd',
  DAY_MONTH: 'dd MMM',
  WEEKDAY: 'EEEE',
};

export const CURRENCY = {
  id: 'currency',
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
};

export const DISTANCE_UNITS = {
  id: 'distance-units',
  KM: 'km',
  MILES: 'mi',
};

export const ANIMATION_DURATIONS = {
  id: 'animation-durations',
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

export const KEY_CODES = {
  id: 'key-codes',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
};

export const BREAKPOINTS = {
  id: 'breakpoints',
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

export const REGEX_PATTERNS = {
  id: 'regex-patterns',
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  NUMBER_ONLY: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  VEHICLE_REGISTRATION: /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/,
};
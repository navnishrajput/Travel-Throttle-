/**
 * FORMATTER UTILITIES
 * Data formatting functions for consistent display
 */

import { format, formatDistance as formatDistanceFns, formatRelative, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS, CURRENCY, DISTANCE_UNITS } from './constants';

/**
 * Date Formatters
 */
export const formatDate = {
  id: 'format-date',
  
  /**
   * Format date to full date string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  full: (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.FULL_DATE) : 'Invalid Date';
  },
  
  /**
   * Format date to short date string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  short: (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.SHORT_DATE) : 'Invalid Date';
  },
  
  /**
   * Format time only
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted time
   */
  time: (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.TIME_ONLY) : 'Invalid Date';
  },
  
  /**
   * Format date and time
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date and time
   */
  dateTime: (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.DATE_TIME) : 'Invalid Date';
  },
  
  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time string
   */
  relative: (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatDistanceFns(dateObj, new Date(), { addSuffix: true }) : 'Invalid Date';
  },
  
  /**
   * Format to ISO date string (YYYY-MM-DD)
   * @param {string|Date} date - Date to format
   * @returns {string} ISO date string
   */
  iso: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.ISO_DATE) : '';
  },
  
  /**
   * Format to readable datetime for input fields
   * @param {string|Date} date - Date to format
   * @returns {string} Datetime-local string
   */
  forInput: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
  },
};

/**
 * Currency Formatters
 */
export const formatCurrency = {
  id: 'format-currency',
  
  /**
   * Format number to currency string
   * @param {number} amount - Amount to format
   * @param {boolean} showSymbol - Whether to show currency symbol
   * @returns {string} Formatted currency
   */
  standard: (amount, showSymbol = true) => {
    if (amount === null || amount === undefined) return 'N/A';
    const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return showSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
  },
  
  /**
   * Format number to compact currency string (e.g., "₹1.2K")
   * @param {number} amount - Amount to format
   * @returns {string} Compact currency string
   */
  compact: (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${CURRENCY.SYMBOL}${formatNumber.compact(amount)}`;
  },
  
  /**
   * Parse currency string to number
   * @param {string} value - Currency string
   * @returns {number} Parsed number
   */
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
  
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  withCommas: (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat(CURRENCY.LOCALE).format(num);
  },
  
  /**
   * Format number to compact notation (e.g., "1.2K", "1.5M")
   * @param {number} num - Number to format
   * @returns {string} Compact number string
   */
  compact: (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  },
  
  /**
   * Format decimal to fixed places
   * @param {number} num - Number to format
   * @param {number} places - Decimal places
   * @returns {string} Formatted decimal
   */
  decimal: (num, places = 2) => {
    if (num === null || num === undefined) return '0.00';
    return num.toFixed(places);
  },
  
  /**
   * Format percentage
   * @param {number} num - Number to format (0-1)
   * @returns {string} Percentage string
   */
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
  
  /**
   * Format distance in kilometers
   * @param {number} km - Distance in kilometers
   * @returns {string} Formatted distance
   */
  km: (km) => {
    if (km === null || km === undefined) return 'N/A';
    return `${Math.round(km)} ${DISTANCE_UNITS.KM}`;
  },
  
  /**
   * Format distance with one decimal place
   * @param {number} km - Distance in kilometers
   * @returns {string} Formatted distance
   */
  kmWithDecimal: (km) => {
    if (km === null || km === undefined) return 'N/A';
    return `${km.toFixed(1)} ${DISTANCE_UNITS.KM}`;
  },
};

// Alias for backward compatibility
export const formatDistance = formatDistanceDisplay;

/**
 * Duration Formatters
 */
export const formatDuration = {
  id: 'format-duration',
  
  /**
   * Format minutes to readable duration
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   */
  fromMinutes: (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  },
  
  /**
   * Format hours to readable duration
   * @param {number} hours - Duration in hours
   * @returns {string} Formatted duration
   */
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
  
  /**
   * Get initials from name
   * @param {string} name - Full name
   * @returns {string} Initials (max 2 characters)
   */
  initials: (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },
  
  /**
   * Truncate name to specified length
   * @param {string} name - Full name
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated name
   */
  truncate: (name, maxLength = 20) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength - 3)}...`;
  },
  
  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
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
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate: (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  },
  
  /**
   * Convert to title case
   * @param {string} text - Text to convert
   * @returns {string} Title case text
   */
  titleCase: (text) => {
    if (!text) return '';
    return text.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
  /**
   * Slugify text (for URLs)
   * @param {string} text - Text to slugify
   * @returns {string} Slugified text
   */
  slugify: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },
  
  /**
   * Strip HTML tags
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
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
  
  /**
   * Format rating to one decimal place
   * @param {number} rating - Rating value
   * @returns {string} Formatted rating
   */
  display: (rating) => {
    if (rating === null || rating === undefined) return '0.0';
    return rating.toFixed(1);
  },
  
  /**
   * Format rating with star symbol
   * @param {number} rating - Rating value
   * @returns {string} Rating with star
   */
  withStar: (rating) => {
    if (rating === null || rating === undefined) return '★ 0.0';
    return `★ ${rating.toFixed(1)}`;
  },
};

// Default export for convenience
export default {
  date: formatDate,
  currency: formatCurrency,
  number: formatNumber,
  distance: formatDistance,
  duration: formatDuration,
  name: formatName,
  text: formatText,
  rating: formatRating,
};
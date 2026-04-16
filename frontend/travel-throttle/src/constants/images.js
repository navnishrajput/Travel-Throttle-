/**
 * IMAGE CONSTANTS
 * Centralized image management
 */

// Temporary placeholder SVG
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23334155\'/%3E%3Ctext x=\'50\' y=\'50\' font-size=\'14\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23f1f5f9\'%3ETT%3C/text%3E%3C/svg%3E';

export const IMAGES = {
  BRAND: {
    LOGO: {
      src: PLACEHOLDER_SVG,
      alt: 'Travel Throttle Logo',
      width: 40,
      height: 40,
    },
    LOGO_SMALL: {
      src: PLACEHOLDER_SVG,
      alt: 'Travel Throttle',
      width: 32,
      height: 32,
    },
  },
  
  AVATAR: {
    DEFAULT: {
      src: PLACEHOLDER_SVG,
      alt: 'Default Avatar',
      width: 100,
      height: 100,
    },
  },
  
  ICONS: {
    BIKE: {
      src: PLACEHOLDER_SVG,
      alt: 'Bike Icon',
    },
    USER: {
      src: PLACEHOLDER_SVG,
      alt: 'User Icon',
    },
    LOCATION: {
      src: PLACEHOLDER_SVG,
      alt: 'Location Icon',
    },
    CALENDAR: {
      src: PLACEHOLDER_SVG,
      alt: 'Calendar Icon',
    },
  },
  
  EMPTY_STATES: {
    NO_RIDES: {
      src: PLACEHOLDER_SVG,
      alt: 'No Rides Found',
      width: 200,
      height: 200,
    },
    NO_MESSAGES: {
      src: PLACEHOLDER_SVG,
      alt: 'No Messages',
      width: 200,
      height: 200,
    },
  },
};

export default IMAGES;
/**
 * THEME CONSTANTS
 * Design system tokens and component styles
 */

export const THEME = {
  id: 'theme',
  COLORS: {
    id: 'theme-colors',
    PRIMARY: '#0ea5e9',
    PRIMARY_DARK: '#0284c7',
    PRIMARY_LIGHT: '#38bdf8',
    SECONDARY: '#6366f1',
    SECONDARY_DARK: '#4f46e5',
    SECONDARY_LIGHT: '#818cf8',
    ACCENT: '#22c55e',
    ACCENT_DARK: '#16a34a',
    ACCENT_LIGHT: '#4ade80',
    DARK_BG: '#0f172a',
    DARK_CARD: '#1e293b',
    DARK_BORDER: '#334155',
    DARK_TEXT: '#f1f5f9',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#0ea5e9',
  },
};

export const COMPONENT_STYLES = {
  id: 'component-styles',
  
  BUTTON: {
    id: 'button-styles',
    BASE: 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    VARIANTS: {
      PRIMARY: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
      SECONDARY: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
      ACCENT: 'bg-accent hover:bg-accent-dark text-white focus:ring-accent',
      OUTLINE: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
      GHOST: 'text-gray-400 hover:text-white hover:bg-dark-card',
      DANGER: 'bg-error hover:bg-red-600 text-white focus:ring-error',
    },
    SIZES: {
      SM: 'px-3 py-1.5 text-sm',
      MD: 'px-4 py-2 text-base',
      LG: 'px-6 py-3 text-lg',
    },
  },
  
  CARD: {
    id: 'card-styles',
    BASE: 'bg-dark-card rounded-xl shadow-xl border border-dark-border',
    HOVER: 'hover:shadow-2xl hover:border-primary/50 transition-all duration-300',
    PADDING: 'p-6',
  },
  
  INPUT: {
    id: 'input-styles',
    BASE: 'w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    ERROR: 'border-error focus:ring-error',
    SUCCESS: 'border-success focus:ring-success',
  },
  
  BADGE: {
    id: 'badge-styles',
    BASE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    VARIANTS: {
      SUCCESS: 'bg-success/20 text-success',
      WARNING: 'bg-warning/20 text-warning',
      ERROR: 'bg-error/20 text-error',
      INFO: 'bg-info/20 text-info',
      PRIMARY: 'bg-primary/20 text-primary',
      SECONDARY: 'bg-secondary/20 text-secondary',
      DEFAULT: 'bg-gray-500/20 text-gray-400',
    },
  },
};
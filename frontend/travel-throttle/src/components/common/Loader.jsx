/**
 * LOADER COMPONENT
 * Loading spinner component
 */

import { cn } from '../../utils/helpers';
import { THEME } from '../../constants';

const LOADER_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

const sizeClasses = {
  [LOADER_SIZES.XS]: 'w-3 h-3',
  [LOADER_SIZES.SM]: 'w-4 h-4',
  [LOADER_SIZES.MD]: 'w-6 h-6',
  [LOADER_SIZES.LG]: 'w-8 h-8',
  [LOADER_SIZES.XL]: 'w-12 h-12',
};

/**
 * Loader Component
 * @param {Object} props - Component props
 * @param {string} props.size - Loader size (xs, sm, md, lg, xl)
 * @param {string} props.color - Custom color
 * @param {string} props.className - Additional classes
 */
export const Loader = ({ 
  size = LOADER_SIZES.MD, 
  color = THEME.COLORS.PRIMARY,
  className = '' 
}) => {
  return (
    <div 
      className={cn('inline-block animate-spin', className)} 
      role="status"
      aria-label="Loading"
    >
      <svg
        className={cn(sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          style={{ color: color }}
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Loader.SIZES = LOADER_SIZES;

export default Loader;
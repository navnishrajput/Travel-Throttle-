/**
 * BADGE COMPONENT
 * Reusable badge for status indicators and labels
 */

import { cn } from '../../utils/helpers';
import { COMPONENT_STYLES } from '../../constants';

const BADGE_VARIANTS = {
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  INFO: 'INFO',
  DEFAULT: 'DEFAULT',
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
};

const BADGE_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
};

const sizeClasses = {
  [BADGE_SIZES.SM]: 'px-2 py-0.5 text-xs',
  [BADGE_SIZES.MD]: 'px-2.5 py-0.5 text-sm',
  [BADGE_SIZES.LG]: 'px-3 py-1 text-base',
};

const variantClasses = {
  [BADGE_VARIANTS.SUCCESS]: 'bg-success/20 text-success border-success/30',
  [BADGE_VARIANTS.WARNING]: 'bg-warning/20 text-warning border-warning/30',
  [BADGE_VARIANTS.ERROR]: 'bg-error/20 text-error border-error/30',
  [BADGE_VARIANTS.INFO]: 'bg-info/20 text-info border-info/30',
  [BADGE_VARIANTS.PRIMARY]: 'bg-primary/20 text-primary border-primary/30',
  [BADGE_VARIANTS.SECONDARY]: 'bg-secondary/20 text-secondary border-secondary/30',
  [BADGE_VARIANTS.DEFAULT]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

/**
 * Badge Component
 */
export const Badge = ({
  variant = BADGE_VARIANTS.DEFAULT,
  size = BADGE_SIZES.MD,
  outlined = false,
  children,
  icon,
  className = '',
}) => {
  // Fallback if COMPONENT_STYLES.BADGE is undefined
  const baseClass = 'inline-flex items-center rounded-full font-medium';
  
  const badgeClasses = cn(
    baseClass,
    sizeClasses[size] || 'px-2.5 py-0.5 text-sm',
    variantClasses[variant] || variantClasses.DEFAULT,
    outlined && 'border',
    !outlined && 'border border-transparent',
    className
  );
  
  return (
    <span className={badgeClasses}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

Badge.VARIANTS = BADGE_VARIANTS;
Badge.SIZES = BADGE_SIZES;

export default Badge;
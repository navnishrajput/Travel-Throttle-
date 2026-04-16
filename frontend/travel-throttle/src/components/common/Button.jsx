/**
 * BUTTON COMPONENT
 */

import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const BUTTON_VARIANTS = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  ACCENT: 'ACCENT',
  OUTLINE: 'OUTLINE',
  GHOST: 'GHOST',
  DANGER: 'DANGER',
};

const BUTTON_SIZES = {
  SM: 'SM',
  MD: 'MD',
  LG: 'LG',
};

const variantClasses = {
  [BUTTON_VARIANTS.PRIMARY]: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
  [BUTTON_VARIANTS.SECONDARY]: 'bg-secondary hover:bg-secondary-dark text-white',
  [BUTTON_VARIANTS.ACCENT]: 'bg-accent hover:bg-accent-dark text-white',
  [BUTTON_VARIANTS.OUTLINE]: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  [BUTTON_VARIANTS.GHOST]: 'text-gray-400 hover:text-white hover:bg-dark-card',
  [BUTTON_VARIANTS.DANGER]: 'bg-error hover:bg-red-600 text-white',
};

const sizeClasses = {
  [BUTTON_SIZES.SM]: 'px-3 py-1.5 text-sm',
  [BUTTON_SIZES.MD]: 'px-4 py-2 text-base',
  [BUTTON_SIZES.LG]: 'px-6 py-3 text-lg',
};

const Button = forwardRef(({
  variant = BUTTON_VARIANTS.PRIMARY,
  size = BUTTON_SIZES.MD,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ...props
}, ref) => {
  
  const buttonClasses = cn(
    'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant] || variantClasses.PRIMARY,
    sizeClasses[size] || sizeClasses.MD,
    fullWidth && 'w-full',
    loading && 'cursor-wait opacity-75',
    className
  );
  
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {leftIcon && !loading && <span className="inline-flex mr-2">{leftIcon}</span>}
      <span className="inline-flex items-center justify-center">{children}</span>
      {rightIcon && !loading && <span className="inline-flex ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
Button.VARIANTS = BUTTON_VARIANTS;
Button.SIZES = BUTTON_SIZES;

export default Button;
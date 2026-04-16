/**
 * CARD COMPONENT
 */

import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Card = forwardRef(({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  children,
  className = '',
  onClick,
  ...props
}, ref) => {
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const cardClasses = cn(
    'bg-dark-card rounded-xl shadow-xl border border-dark-border',
    paddingClasses[padding] || paddingClasses.md,
    hoverable && 'hover:shadow-2xl hover:border-primary/50 transition-all duration-300',
    clickable && 'cursor-pointer',
    className
  );
  
  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = ({ children, className = '', action = null }) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {typeof children === 'string' ? (
        <h3 className="text-xl font-bold text-white">{children}</h3>
      ) : (
        children
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

const CardBody = ({ children, className = '' }) => {
  return <div className={cn('flex-1', className)}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-dark-border', className)}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { CardHeader, CardBody, CardFooter };
export default Card;
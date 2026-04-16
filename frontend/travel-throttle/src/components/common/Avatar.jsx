/**
 * AVATAR COMPONENT
 * Reusable avatar component with fallback
 */

import { useState } from 'react';
import { cn, getInitials } from '../../utils/helpers';
import { IMAGES, THEME } from '../../constants';

const AVATAR_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
};

const sizeClasses = {
  [AVATAR_SIZES.XS]: 'w-6 h-6 text-xs',
  [AVATAR_SIZES.SM]: 'w-8 h-8 text-sm',
  [AVATAR_SIZES.MD]: 'w-10 h-10 text-base',
  [AVATAR_SIZES.LG]: 'w-12 h-12 text-lg',
  [AVATAR_SIZES.XL]: 'w-16 h-16 text-xl',
  [AVATAR_SIZES['2XL']]: 'w-24 h-24 text-2xl',
};

/**
 * Avatar Component
 * @param {Object} props - Component props
 * @param {string} props.src - Image source
 * @param {string} props.alt - Alt text
 * @param {string} props.name - Name for initials fallback
 * @param {string} props.size - Avatar size
 * @param {string} props.status - Online status (online, offline, busy, away)
 * @param {boolean} props.bordered - Add border
 * @param {string} props.className - Additional classes
 */
export const Avatar = ({
  src = '',
  alt = 'Avatar',
  name = '',
  size = AVATAR_SIZES.MD,
  status = null,
  bordered = false,
  className = '',
}) => {
  const [error, setError] = useState(false);
  
  const avatarClasses = cn(
    'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20',
    sizeClasses[size],
    bordered && 'ring-2 ring-primary',
    className
  );
  
  const statusColors = {
    online: 'bg-success',
    offline: 'bg-gray-500',
    busy: 'bg-error',
    away: 'bg-warning',
  };
  
  const statusSizes = {
    [AVATAR_SIZES.XS]: 'w-1.5 h-1.5',
    [AVATAR_SIZES.SM]: 'w-2 h-2',
    [AVATAR_SIZES.MD]: 'w-2.5 h-2.5',
    [AVATAR_SIZES.LG]: 'w-3 h-3',
    [AVATAR_SIZES.XL]: 'w-3.5 h-3.5',
    [AVATAR_SIZES['2XL']]: 'w-4 h-4',
  };
  
  // Render image or initials
  const renderContent = () => {
    if (src && !error) {
      return (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      );
    }
    
    // Show initials
    const initials = name ? getInitials(name) : '?';
    return (
      <span className="font-semibold text-white">
        {initials}
      </span>
    );
  };
  
  return (
    <div className={avatarClasses}>
      {renderContent()}
      
      {/* Status Indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-dark-card',
            statusColors[status],
            statusSizes[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.SIZES = AVATAR_SIZES;

/**
 * Avatar Group Component
 */
export const AvatarGroup = ({
  children,
  max = 5,
  size = AVATAR_SIZES.MD,
  className = '',
}) => {
  const avatars = Array.isArray(children) ? children : [children];
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  
  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayAvatars.map((avatar, index) => (
        <div key={index} className="relative ring-2 ring-dark-card rounded-full">
          {avatar}
        </div>
      ))}
      
      {remaining > 0 && (
        <Avatar
          name={`+${remaining}`}
          size={size}
          className="ring-2 ring-dark-card"
        />
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
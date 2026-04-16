/**
 * USER AVATAR COMPONENT
 * Enhanced avatar with user info and actions
 */

import { cn } from '../../utils/helpers';
import { Avatar, Badge } from '../common';
import { FiStar, FiShield, FiMoreVertical } from 'react-icons/fi';

/**
 * UserAvatar Component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @param {string} props.size - Avatar size
 * @param {boolean} props.showInfo - Show user info
 * @param {boolean} props.showRating - Show rating
 * @param {boolean} props.showVerified - Show verified badge
 * @param {boolean} props.clickable - Make avatar clickable
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional classes
 */
export const UserAvatar = ({ 
  user,
  size = 'md',
  showInfo = false,
  showRating = false,
  showVerified = true,
  clickable = false,
  onClick,
  className = '' 
}) => {
  
  if (!user) return null;
  
  const {
    name,
    avatar,
    rating,
    verified = false,
    status,
    totalRides
  } = user;
  
  const avatarComponent = (
    <div className="relative">
      <Avatar 
        src={avatar} 
        name={name}
        size={size}
        status={status}
        bordered={verified}
      />
      {verified && showVerified && (
        <div className="absolute -top-1 -right-1">
          <FiShield className="w-4 h-4 text-primary bg-dark-card rounded-full p-0.5" />
        </div>
      )}
    </div>
  );
  
  if (!showInfo) {
    return (
      <div 
        className={cn(
          'inline-flex',
          clickable && 'cursor-pointer',
          className
        )}
        onClick={clickable ? onClick : undefined}
      >
        {avatarComponent}
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        'flex items-center gap-3',
        clickable && 'cursor-pointer hover:bg-dark-bg/50 p-2 rounded-lg transition-colors',
        className
      )}
      onClick={clickable ? onClick : undefined}
    >
      {avatarComponent}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{name}</p>
          {verified && (
            <Badge variant="primary" size="sm">Verified</Badge>
          )}
        </div>
        
        {(showRating || totalRides) && (
          <div className="flex items-center gap-3 mt-0.5">
            {showRating && rating && (
              <div className="flex items-center gap-1 text-sm">
                <FiStar className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-300">{rating.toFixed(1)}</span>
              </div>
            )}
            {totalRides && (
              <span className="text-sm text-gray-400">{totalRides} rides</span>
            )}
          </div>
        )}
      </div>
      
      {clickable && (
        <FiMoreVertical className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );
};

export default UserAvatar;
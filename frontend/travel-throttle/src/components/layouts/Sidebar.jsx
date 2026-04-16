/**
 * SIDEBAR COMPONENT
 * Main navigation sidebar
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';
import { ROUTES, IMAGES } from '../../constants';
import { Avatar } from '../common';
import { 
  FiHome, 
  FiSearch, 
  FiPlusCircle, 
  FiList, 
  FiMessageCircle, 
  FiUser,
  FiTool,
  FiChevronLeft,
  FiChevronRight,
  FiBell
} from 'react-icons/fi';

// Navigation items configuration
const NAV_ITEMS = [
  {
    id: 'nav-dashboard',
    icon: FiHome,
    label: 'Dashboard',
    path: ROUTES.PROTECTED.DASHBOARD.path,
  },
  {
    id: 'nav-find-ride',
    icon: FiSearch,
    label: 'Find Ride',
    path: ROUTES.PROTECTED.FIND_RIDE.path,
  },
  {
    id: 'nav-create-ride',
    icon: FiPlusCircle,
    label: 'Create Ride',
    path: ROUTES.PROTECTED.CREATE_RIDE.path,
  },
  {
    id: 'nav-my-rides',
    icon: FiList,
    label: 'My Rides',
    path: ROUTES.PROTECTED.MY_RIDES.path,
  },
  {
    id: 'nav-messages',
    icon: FiMessageCircle,
    label: 'Messages',
    path: ROUTES.PROTECTED.MESSAGES.path,
  },
  {
    id: 'nav-notifications',
    icon: FiBell,
    label: 'Notifications',
    path: ROUTES.PROTECTED.NOTIFICATIONS.path,
  },
  {
    id: 'nav-garage',
    icon: FiTool,
    label: 'My Garage',
    path: ROUTES.PROTECTED.GARAGE.path,
  },
  {
    id: 'nav-profile',
    icon: FiUser,
    label: 'Profile',
    path: ROUTES.PROTECTED.PROFILE.path,
  },
];

/**
 * Sidebar Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Sidebar open state (mobile)
 * @param {boolean} props.collapsed - Sidebar collapsed state (desktop)
 * @param {Function} props.onToggle - Toggle collapse handler
 */
export const Sidebar = ({ 
  isOpen = true, 
  collapsed = false,
  onToggle 
}) => {
  const { user } = useAuth();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-16 left-0 bottom-0 bg-dark-card border-r border-dark-border transition-all duration-300 z-40',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-20' : 'w-64'
      )}>
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-6 w-6 h-6 bg-dark-card border border-dark-border rounded-full',
            'flex items-center justify-center text-gray-400 hover:text-white transition-colors',
            'hidden lg:flex'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <FiChevronRight className="w-3 h-3" />
          ) : (
            <FiChevronLeft className="w-3 h-3" />
          )}
        </button>
        
        {/* Navigation */}
        <nav className="h-full overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      'text-gray-400 hover:text-white hover:bg-dark-bg',
                      isActive && 'bg-primary/10 text-primary border-l-2 border-primary',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.label : ''}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    
                    {!collapsed && (
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          
          {/* Bottom Section - User Info */}
          {!collapsed && (
            <div className="absolute bottom-4 left-2 right-2">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={user?.avatar} 
                    name={user?.name || 'User'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name?.split(' ')[0] || 'Rider'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.hasBike ? '🏍️ Bike Owner' : '🧑 Rider'}
                    </p>
                    {user?.verified && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-white">
                      ⭐ {user?.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">Rides</span>
                    <span className="text-white">{user?.totalRides || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Collapsed User Avatar */}
          {collapsed && (
            <div className="absolute bottom-4 left-2 right-2 flex justify-center">
              <Avatar 
                src={user?.avatar} 
                name={user?.name || 'User'}
                size="md"
                title={user?.name || 'User'}
              />
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
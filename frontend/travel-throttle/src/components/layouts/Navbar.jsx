/**
 * NAVBAR COMPONENT
 * Top navigation bar with fancy logo and working search
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { rideService } from '../../services/rideService';
import { cn, formatDate } from '../../utils/helpers';
import { ROUTES } from '../../constants';
import { Avatar, Badge, Button, Input } from '../common';
import { 
  FiBell, FiMessageSquare, FiSearch, FiMenu, FiX,
  FiLogOut, FiUser, FiSettings, FiHelpCircle,
  FiCheck, FiUserPlus, FiCheckCircle, FiXCircle,
  FiMessageCircle, FiMapPin, FiNavigation, FiLoader,
  FiChevronRight, FiClock, FiUsers, FiDollarSign
} from 'react-icons/fi';
import { FaMotorcycle, FaUsers } from 'react-icons/fa';

export const Navbar = ({ sidebarOpen = false, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  
  const currentUser = {
    name: user?.name || 'User',
    email: user?.email || '',
    avatar: user?.avatar || null,
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const response = await notificationService.getMyNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifs(false);
    }
  };
  
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };
  
  // Search functionality
  const handleSearch = async (value) => {
    setSearchQuery(value);
    
    if (value.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setSearchLoading(true);
    try {
      console.log('Searching for:', value);
      const response = await rideService.searchRides({ 
        source: value, 
        destination: value 
      });
      
      console.log('Search response:', response);
      
      if (response.success) {
        let rides = [];
        if (response.data?.content) {
          rides = response.data.content;
        } else if (Array.isArray(response.data)) {
          rides = response.data;
        }
        
        const validRides = rides.filter(ride => 
          ride && ride.id && ride.status === 'UPCOMING' && ride.availableSeats > 0
        );
        
        setSearchResults(validRides.slice(0, 5));
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleSearchSelect = (ride) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/rides/${ride.id}`);
  };
  
  const handleBellClick = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
    setShowSearchResults(false);
    setShowUserMenu(false);
  };
  
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'RIDE_REQUEST': return <FiUserPlus className="w-4 h-4 text-primary" />;
      case 'RIDE_APPROVED': return <FiCheckCircle className="w-4 h-4 text-success" />;
      case 'RIDE_REJECTED': return <FiXCircle className="w-4 h-4 text-error" />;
      case 'NEW_MESSAGE': return <FiMessageCircle className="w-4 h-4 text-info" />;
      default: return <FiBell className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id);
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setShowNotifications(false);
    
    if (notification.type === 'RIDE_REQUEST') {
      navigate('/my-rides');
    } else if (notification.type === 'RIDE_APPROVED' || notification.type === 'RIDE_REJECTED') {
      if (notification.referenceId) {
        navigate(`/rides/${notification.referenceId}`);
      } else {
        navigate('/my-rides');
      }
    } else if (notification.type === 'NEW_MESSAGE') {
      if (notification.referenceId) {
        navigate(`/messages?rideId=${notification.referenceId}`);
      } else {
        navigate('/messages');
      }
    } else {
      navigate('/notifications');
    }
  };
  
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate(ROUTES.PUBLIC.LOGIN.path);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-card/95 backdrop-blur-xl border-b border-dark-border shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
            
            <Link to={ROUTES.PROTECTED.DASHBOARD.path} className="flex items-center gap-3 group">
              {/* Animated Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FaMotorcycle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Stylish Text */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Travel
                  </span>
                  <span className="text-white ml-1">Throttle</span>
                </h1>
                <p className="text-[10px] text-gray-400 -mt-1 tracking-wider">
                  RIDE TOGETHER • SAVE TOGETHER
                </p>
              </div>
            </Link>
          </div>
          
          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for rides, destinations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                className="w-full bg-dark-bg/50 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FiLoader className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowSearchResults(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card rounded-xl shadow-2xl border border-dark-border z-40 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(ride => (
                      <div
                        key={ride.id}
                        onClick={() => handleSearchSelect(ride)}
                        className="p-4 hover:bg-dark-bg/50 cursor-pointer border-b border-dark-border last:border-0 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <FiMapPin className="w-4 h-4 text-primary" />
                            <div className="w-0.5 h-8 bg-dark-border my-1" />
                            <FiNavigation className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium group-hover:text-primary transition-colors">
                              {ride.source}
                            </p>
                            <p className="text-gray-400 text-sm">{ride.destination}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="flex items-center gap-1 text-gray-500">
                                <FiClock className="w-3 h-3" /> {formatDate.short(ride.dateTime)}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <FiUsers className="w-3 h-3" /> {ride.availableSeats} seats
                              </span>
                              <span className="flex items-center gap-1 text-accent">
                                <FiDollarSign className="w-3 h-3" /> ₹{ride.costPerPerson}
                              </span>
                            </div>
                          </div>
                          <FiChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FiSearch className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                      <p className="text-gray-400">No rides found</p>
                      <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            
            {/* Messages */}
            <button
              onClick={() => navigate(ROUTES.PROTECTED.MESSAGES.path)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors relative"
              aria-label="Messages"
            >
              <FiMessageSquare className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors relative"
                aria-label="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge variant="error" size="sm" className="absolute -top-1 -right-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-96 bg-dark-card rounded-xl shadow-2xl border border-dark-border z-40 max-h-[500px] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-dark-border flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="primary" size="sm">{unreadCount} new</Badge>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 max-h-96">
                      {loadingNotifs ? (
                        <div className="p-8 flex justify-center">
                          <FiLoader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 hover:bg-dark-bg/50 cursor-pointer border-b border-dark-border last:border-0 transition-colors ${
                              !notification.isRead ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-white truncate">
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <button
                                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                                      className="p-1 text-gray-400 hover:text-success rounded transition-colors"
                                      title="Mark as read"
                                    >
                                      <FiCheck className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.timeAgo || formatDate.relative(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-8">No notifications</p>
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-dark-border">
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-primary hover:text-primary-light transition-colors"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-bg transition-colors"
                aria-label="User menu"
              >
                <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                <span className="hidden lg:block text-sm font-medium text-white">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
              
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-dark-card rounded-xl shadow-2xl border border-dark-border z-40 overflow-hidden">
                    <div className="p-4 border-b border-dark-border">
                      <p className="font-semibold text-white">{currentUser.name}</p>
                      <p className="text-sm text-gray-400">{currentUser.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => { setShowUserMenu(false); navigate(ROUTES.PROTECTED.PROFILE.path); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                      >
                        <FiUser className="w-4 h-4" /> Your Profile
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); navigate(ROUTES.PROTECTED.GARAGE.path); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                      >
                        <FaMotorcycle className="w-4 h-4" /> My Garage
                      </button>
                      {/* GROUP RIDES MENU ITEM */}
                      <button
                        onClick={() => { setShowUserMenu(false); navigate('/group-rides'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                      >
                        <FaUsers className="w-4 h-4" /> Group Rides
                      </button>
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                      >
                        <FiHelpCircle className="w-4 h-4" /> Help & Support
                      </button>
                    </div>
                    
                    <div className="border-t border-dark-border py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden pb-3" ref={searchRef}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for rides..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-dark-bg/50 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FiLoader className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
            </div>
            
            {/* Mobile Search Results */}
            {showSearch && searchResults.length > 0 && (
              <div className="mt-2 bg-dark-card rounded-xl border border-dark-border max-h-64 overflow-y-auto">
                {searchResults.map(ride => (
                  <div
                    key={ride.id}
                    onClick={() => {
                      handleSearchSelect(ride);
                      setShowSearch(false);
                    }}
                    className="p-3 hover:bg-dark-bg/50 cursor-pointer border-b border-dark-border last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <FiMapPin className="w-4 h-4 text-primary" />
                        <div className="w-0.5 h-6 bg-dark-border my-1" />
                        <FiNavigation className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{ride.source}</p>
                        <p className="text-gray-400 text-xs">{ride.destination}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDate.short(ride.dateTime)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
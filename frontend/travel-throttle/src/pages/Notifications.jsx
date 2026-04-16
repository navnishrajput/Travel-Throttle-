/**
 * NOTIFICATIONS PAGE
 * Enhanced notifications with better styling
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { formatDate } from '../utils/helpers';
import { Card, Button, Badge } from '../components/common';
import { 
  FiBell, FiCheck, FiTrash2, FiUserPlus, FiCheckCircle, 
  FiXCircle, FiMessageCircle, FiInbox
} from 'react-icons/fi';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'RIDE_REQUEST': return <FiUserPlus className="w-5 h-5 text-primary" />;
    case 'RIDE_APPROVED': return <FiCheckCircle className="w-5 h-5 text-success" />;
    case 'RIDE_REJECTED': return <FiXCircle className="w-5 h-5 text-error" />;
    case 'NEW_MESSAGE': return <FiMessageCircle className="w-5 h-5 text-info" />;
    default: return <FiBell className="w-5 h-5 text-gray-400" />;
  }
};

export const Notifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications();
      console.log('Notifications page - Response:', response);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSuccessMessage('All notifications marked as read');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.type === 'RIDE_REQUEST') {
      navigate('/my-rides');
    } else if (notification.referenceId) {
      navigate(`/rides/${notification.referenceId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiBell className="text-primary" />
            Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 text-success" />
          <p className="text-success">{successMessage}</p>
        </div>
      )}

      <Card>
        <div className="flex gap-2 border-b border-dark-border pb-3 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              filter === 'unread' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
            }`}
          >
            Unread
            {unreadCount > 0 && <Badge variant="error" size="sm">{unreadCount}</Badge>}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'read' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
            }`}
          >
            Read
          </button>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl transition-all cursor-pointer hover:bg-dark-bg/50 ${
                  !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !notification.isRead ? 'bg-primary/20' : 'bg-dark-bg/50'
                  }`}>
                    <NotificationIcon type={notification.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        <p className="text-gray-300 text-sm mt-0.5">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timeAgo || formatDate.relative(notification.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                            className="p-2 text-gray-400 hover:text-success rounded-lg hover:bg-dark-bg transition-colors"
                            title="Mark as read"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                          className="p-2 text-gray-400 hover:text-error rounded-lg hover:bg-dark-bg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <FiInbox className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? "You're all caught up! We'll notify you when something happens."
                : filter === 'unread'
                ? "You have no unread notifications."
                : "You have no read notifications."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
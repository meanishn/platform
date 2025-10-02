import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button, Badge } from '../ui';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service_request': return '🛠️';
      case 'payment': return '💰';
      case 'provider_update': return '👷';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '📢';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate without page reload
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93M8.5 3.5L12 7M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.83 0 1.63.11 2.38.32M15 17h5l-5 5v-5z" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs bg-gradient-to-r from-secondary-400 to-secondary-600 text-white rounded-full animate-pulse-glow shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-white/20 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <span className="animate-float">🔔</span>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-white/10">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:backdrop-blur-lg ${
                      !notification.read ? 'bg-primary-500/20 border-l-4 border-primary-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                          <span className="text-lg">
                            {getCategoryIcon(notification.category)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white text-sm">
                            {notification.title}
                          </p>
                          <span className="text-xs">
                            {getNotificationIcon(notification.type)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {notification.actionText && (
                            <span className="text-xs text-blue-600 font-medium">
                              {notification.actionText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-2">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400">
                  You'll see updates about your requests here
                </p>
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

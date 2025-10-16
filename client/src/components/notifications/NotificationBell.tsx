import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { Button, Badge } from '../ui';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Wrench, DollarSign, HardHat, Settings, PartyPopper, Megaphone } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'info':
      default: return Info;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service_request': return Wrench;
      case 'payment': return DollarSign;
      case 'provider_update': return HardHat;
      case 'system': return Settings;
      case 'promotion': return PartyPopper;
      default: return Megaphone;
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
        className="relative p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs bg-red-600 text-white rounded-full font-medium shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-600" />
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

          <div className="max-h-80 overflow-y-auto bg-white">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.slice(0, 10).map((notification) => {
                  const CategoryIcon = getCategoryIcon(notification.category);
                  const TypeIcon = getNotificationIcon(notification.type);
                  
                  return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-slate-50 border-l-4 border-slate-700' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                          <CategoryIcon className="w-5 h-5 text-slate-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">
                            {notification.title}
                          </p>
                          <TypeIcon className="w-3.5 h-3.5 text-slate-500" />
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {notification.actionText && (
                            <span className="text-xs text-slate-700 font-semibold hover:text-slate-900">
                              {notification.actionText} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium">No notifications yet</p>
                <p className="text-sm text-slate-600 mt-1">
                  You'll see updates about your requests here
                </p>
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-4 border-t border-slate-200 text-center bg-slate-50">
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

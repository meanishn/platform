import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationApi } from '../services/realApi';
import { NotificationDto } from '../types/api';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'service_request' | 'payment' | 'provider_update' | 'system' | 'promotion';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time notifications (WebSocket or polling)
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Don't fetch if not logged in
      
      const response = await notificationApi.getUserNotifications();
      if (response.success && response.data && response.data.notifications) {
        // Convert server notifications to client format
        const clientNotifications: Notification[] = response.data.notifications.map((n: NotificationDto) => {
          // Derive actionUrl and actionText based on notification type and data
          let actionUrl: string | undefined;
          let actionText: string | undefined;
          let category: Notification['category'] = 'system';

          switch (n.type) {
            case 'new_assignment':
              // Navigate to available jobs with jobId parameter to auto-open modal
              actionUrl = n.data?.requestId 
                ? `/provider/available-jobs?jobId=${n.data.requestId}`
                : `/provider/available-jobs`;
              actionText = 'View Job Details';
              category = 'service_request';
              break;
            case 'provider_accepted':
              actionUrl = n.data?.requestId ? `/requests/${n.data.requestId}` : undefined;
              actionText = 'Select Provider';
              category = 'provider_update';
              break;
            case 'assignment_confirmed':
              // Navigate to assignments (could be enhanced to auto-open specific assignment)
              actionUrl = `/provider/assignments`;
              actionText = 'View Assignment';
              category = 'service_request';
              break;
            case 'job_started':
            case 'job_completed':
              actionUrl = n.data?.requestId ? `/requests/${n.data.requestId}` : undefined;
              actionText = 'View Request';
              category = 'service_request';
              break;
            default:
              // Keep actionUrl/actionText undefined for unknown types
              break;
          }

          return {
            id: n.id.toString(),
            type: 'info', // Default type, could be derived from n.type
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt),
            read: n.isRead,
            category,
            actionUrl,
            actionText
          };
        });
        setNotifications(clientNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(parseInt(id));
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(parseInt(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

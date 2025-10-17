import React, { useEffect, useState } from 'react';
import { Button } from '../ui';

interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface ToastProps {
  notification: ToastNotification;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-remove after duration (unless persistent)
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "rounded-lg shadow-lg border p-4 transition-all duration-300 transform";
    const visibilityStyles = isVisible && !isRemoving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    switch (notification.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 border-green-200 text-green-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 border-red-200 text-red-800`;
      case 'info':
      default:
        return `${baseStyles} ${visibilityStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-1">
            {notification.title}
          </p>
          <p className="text-sm opacity-90">
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, persistent?: boolean) => {
    addToast({ type: 'error', title, message, persistent });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

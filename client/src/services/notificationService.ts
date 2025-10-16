import { useToast } from '../components/notifications/ToastNotification';
import { useNotifications } from '../hooks/useNotifications';

export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'service_request' | 'payment' | 'provider_update' | 'system' | 'promotion';
  actionUrl?: string;
  actionText?: string;
  showToast?: boolean;
  persistent?: boolean;
  duration?: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private addNotification: any;
  private showToast: any;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(addNotification: any, showToast: any) {
    this.addNotification = addNotification;
    this.showToast = showToast;
  }

  notify(options: NotificationOptions) {
    const {
      title,
      message,
      type = 'info',
      category = 'system',
      actionUrl,
      actionText,
      showToast = true,
      persistent = false,
      duration = 5000
    } = options;

    // Add to notification center
    if (this.addNotification) {
      this.addNotification({
        type,
        title,
        message,
        category,
        actionUrl,
        actionText
      });
    }

    // Show toast notification
    if (showToast && this.showToast) {
      const toastFn = this.showToast[type];
      if (toastFn && typeof toastFn === 'function') {
        toastFn(title, message, { persistent, duration });
      }
    }
  }

  // Convenience methods for common notification types
  success(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      type: 'success',
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      type: 'error',
      persistent: true,
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      type: 'warning',
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      type: 'info',
      ...options
    });
  }

  // Service-specific notifications
  serviceRequest(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      category: 'service_request',
      actionUrl: '/requests',
      actionText: 'View Request',
      ...options
    });
  }

  payment(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      category: 'payment',
      actionUrl: '/billing',
      actionText: 'View Payment',
      ...options
    });
  }

  providerUpdate(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      category: 'provider_update',
      actionUrl: '/provider/dashboard',
      actionText: 'View Update',
      ...options
    });
  }

  promotion(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.notify({
      title,
      message,
      category: 'promotion',
      type: 'info',
      ...options
    });
  }
}

// React hook for easy notification usage
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const notificationService = NotificationService.getInstance();
  
  // Initialize with current context functions
  notificationService.initialize(addNotification, {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  });

  return {
    notify: (options: NotificationOptions) => notificationService.notify(options),
    success: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.success(title, message, options),
    error: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.error(title, message, options),
    warning: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.warning(title, message, options),
    info: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.info(title, message, options),
    serviceRequest: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.serviceRequest(title, message, options),
    payment: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.payment(title, message, options),
    providerUpdate: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.providerUpdate(title, message, options),
    promotion: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationService.promotion(title, message, options)
  };
};

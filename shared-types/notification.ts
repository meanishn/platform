/**
 * Notification Types
 */

export interface NotificationDto {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListDto {
  notifications: NotificationDto[];
  unreadCount: number;
}

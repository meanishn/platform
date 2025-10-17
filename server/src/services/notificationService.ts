import Notification from '../models/Notification';
import type { NotificationDto, NotificationListDto } from '../../../shared-types';
import { toNotificationDto, toNotificationListDto } from '../sanitizers';

export interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  
  /**
   * Create a new notification
   */
  async create(data: CreateNotificationData): Promise<NotificationDto> {
    const notification = await Notification.query().insertAndFetch({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      is_read: false,
      is_push_sent: false,
      is_email_sent: false
    });

    return toNotificationDto(notification);
  }

  /**
   * Alias for create() - for consistency across services
   */
  async createNotification(data: CreateNotificationData): Promise<NotificationDto> {
    return this.create(data);
  }

  /**
   * Get user notifications with unread count
   */
  async getUserNotifications(userId: number, limit = 50): Promise<NotificationListDto> {
    const [notifications, unreadCount] = await Promise.all([
      Notification.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit),
      Notification.query()
        .where('user_id', userId)
        .where('is_read', false)
        .resultSize()
    ]);

    // ✅ Use centralized sanitizer
    return toNotificationListDto(notifications, unreadCount);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<NotificationDto> {
    const notification = await Notification.query().findById(notificationId);
    if (!notification) throw new Error('Notification not found');
    if (notification.user_id !== userId) throw new Error('Unauthorized');

    const updated = await Notification.query().patchAndFetchById(notificationId, {
      is_read: true,
      read_at: new Date().toISOString()
    });

    return toNotificationDto(updated);
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: number): Promise<number> {
    return Notification.query()
      .patch({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .where('user_id', userId)
      .where('is_read', false);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await Notification.query().findById(notificationId);
    if (!notification) throw new Error('Notification not found');
    if (notification.user_id !== userId) throw new Error('Unauthorized');

    await Notification.query().deleteById(notificationId);
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: number): Promise<number> {
    return Notification.query()
      .delete()
      .where('user_id', userId);
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const result = await Notification.query()
      .where('user_id', userId)
      .where('is_read', false)
      .count('* as count')
      .first();
    
    return parseInt((result as any)?.count || '0');
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  async cleanupOldNotifications(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Notification.query()
      .delete()
      .where('created_at', '<', thirtyDaysAgo.toISOString());
  }

  // Placeholder methods for future implementation
  async sendPushNotification(notification: Notification): Promise<void> {
    // TODO: Implement push notification logic
    console.log(`📱 Push notification: ${notification.title} to user ${notification.user_id}`);
  }

  async sendEmailNotification(notification: Notification): Promise<void> {
    // TODO: Implement email notification logic
    console.log(`📧 Email notification: ${notification.title} to user ${notification.user_id}`);
  }
}

export const notificationService = new NotificationService();

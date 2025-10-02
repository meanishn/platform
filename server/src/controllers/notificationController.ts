import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Get user notifications
   */
  getUserNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { limit = 50 } = req.query;

      const notifications = await this.notificationService.getUserNotifications(
        userId,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get notifications'
      });
    }
  };

  /**
   * Mark notification as read
   */
  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { notificationId } = req.params;

      const notification = await this.notificationService.markAsRead(
        parseInt(notificationId),
        userId
      );

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark as read'
      });
    }
  };

  /**
   * Mark all notifications as read
   */
  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const count = await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notifications marked as read`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark all as read'
      });
    }
  };

  /**
   * Get unread notification count
   */
  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get unread count'
      });
    }
  };

  /**
   * Delete a notification
   */
  deleteNotification = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { notificationId } = req.params;

      await this.notificationService.deleteNotification(parseInt(notificationId), userId);

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete notification'
      });
    }
  };

  /**
   * Delete all notifications for user
   */
  deleteAllNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const count = await this.notificationService.deleteAllNotifications(userId);

      res.json({
        success: true,
        message: `${count} notifications deleted`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete notifications'
      });
    }
  };
}

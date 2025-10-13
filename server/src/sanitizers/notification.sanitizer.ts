/**
 * Notification Sanitizer
 * Handles all notification-related data sanitization
 */

import Notification from '../models/Notification';
import type { NotificationDto, NotificationListDto } from '../../../shared-types';
import { sanitizeArray } from './base.sanitizer';

/**
 * Convert Notification model to NotificationDto
 */
export function toNotificationDto(notification: Notification | any): NotificationDto {
  return {
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.is_read,
    readAt: notification.read_at,
    createdAt: notification.created_at
  };
}

/**
 * Convert notifications array to NotificationListDto with unread count
 */
export function toNotificationListDto(
  notifications: Notification[],
  unreadCount: number
): NotificationListDto {
  return {
    notifications: toNotificationDtoArray(notifications),
    unreadCount
  };
}

/**
 * Sanitize array of notifications to DTOs
 */
export function toNotificationDtoArray(notifications: Notification[]): NotificationDto[] {
  return sanitizeArray(notifications, toNotificationDto);
}


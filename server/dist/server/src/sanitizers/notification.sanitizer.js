"use strict";
/**
 * Notification Sanitizer
 * Handles all notification-related data sanitization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNotificationDto = toNotificationDto;
exports.toNotificationListDto = toNotificationListDto;
exports.toNotificationDtoArray = toNotificationDtoArray;
const base_sanitizer_1 = require("./base.sanitizer");
/**
 * Convert Notification model to NotificationDto
 */
function toNotificationDto(notification) {
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
function toNotificationListDto(notifications, unreadCount) {
    return {
        notifications: toNotificationDtoArray(notifications),
        unreadCount
    };
}
/**
 * Sanitize array of notifications to DTOs
 */
function toNotificationDtoArray(notifications) {
    return (0, base_sanitizer_1.sanitizeArray)(notifications, toNotificationDto);
}

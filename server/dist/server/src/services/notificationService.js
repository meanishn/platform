"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
/**
 * Mapper function to convert model instance to DTO
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
        readAt: notification.read_at || undefined,
        createdAt: notification.created_at
    };
}
class NotificationService {
    /**
     * Create a new notification
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.default.query().insertAndFetch({
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
        });
    }
    /**
     * Alias for create() - for consistency across services
     */
    createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create(data);
        });
    }
    /**
     * Get user notifications with unread count
     */
    getUserNotifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50) {
            const [notifications, unreadCount] = yield Promise.all([
                Notification_1.default.query()
                    .where('user_id', userId)
                    .orderBy('created_at', 'desc')
                    .limit(limit),
                Notification_1.default.query()
                    .where('user_id', userId)
                    .where('is_read', false)
                    .resultSize()
            ]);
            return {
                notifications: notifications.map(toNotificationDto),
                unreadCount
            };
        });
    }
    /**
     * Mark notification as read
     */
    markAsRead(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.default.query().findById(notificationId);
            if (!notification)
                throw new Error('Notification not found');
            if (notification.user_id !== userId)
                throw new Error('Unauthorized');
            const updated = yield Notification_1.default.query().patchAndFetchById(notificationId, {
                is_read: true,
                read_at: new Date().toISOString()
            });
            return toNotificationDto(updated);
        });
    }
    /**
     * Mark all notifications as read for user
     */
    markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification_1.default.query()
                .patch({
                is_read: true,
                read_at: new Date().toISOString()
            })
                .where('user_id', userId)
                .where('is_read', false);
        });
    }
    /**
     * Delete notification
     */
    deleteNotification(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.default.query().findById(notificationId);
            if (!notification)
                throw new Error('Notification not found');
            if (notification.user_id !== userId)
                throw new Error('Unauthorized');
            yield Notification_1.default.query().deleteById(notificationId);
        });
    }
    /**
     * Delete all notifications for user
     */
    deleteAllNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification_1.default.query()
                .delete()
                .where('user_id', userId);
        });
    }
    /**
     * Get unread count for user
     */
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Notification_1.default.query()
                .where('user_id', userId)
                .where('is_read', false)
                .count('* as count')
                .first();
            return parseInt((result === null || result === void 0 ? void 0 : result.count) || '0');
        });
    }
    /**
     * Delete old notifications (older than 30 days)
     */
    cleanupOldNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return Notification_1.default.query()
                .delete()
                .where('created_at', '<', thirtyDaysAgo.toISOString());
        });
    }
    // Placeholder methods for future implementation
    sendPushNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement push notification logic
            console.log(`📱 Push notification: ${notification.title} to user ${notification.user_id}`);
        });
    }
    sendEmailNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement email notification logic
            console.log(`📧 Email notification: ${notification.title} to user ${notification.user_id}`);
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();

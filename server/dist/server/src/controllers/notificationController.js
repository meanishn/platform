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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    constructor() {
        /**
         * Get user notifications
         */
        this.getUserNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { limit = 50 } = req.query;
                const notifications = yield this.notificationService.getUserNotifications(userId, parseInt(limit));
                res.json({
                    success: true,
                    data: notifications
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get notifications'
                });
            }
        });
        /**
         * Mark notification as read
         */
        this.markAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { notificationId } = req.params;
                const notification = yield this.notificationService.markAsRead(parseInt(notificationId), userId);
                res.json({
                    success: true,
                    message: 'Notification marked as read',
                    data: notification
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to mark as read'
                });
            }
        });
        /**
         * Mark all notifications as read
         */
        this.markAllAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const count = yield this.notificationService.markAllAsRead(userId);
                res.json({
                    success: true,
                    message: `${count} notifications marked as read`
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to mark all as read'
                });
            }
        });
        /**
         * Get unread notification count
         */
        this.getUnreadCount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const count = yield this.notificationService.getUnreadCount(userId);
                res.json({
                    success: true,
                    data: { unreadCount: count }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get unread count'
                });
            }
        });
        /**
         * Delete a notification
         */
        this.deleteNotification = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { notificationId } = req.params;
                yield this.notificationService.deleteNotification(parseInt(notificationId), userId);
                res.json({
                    success: true,
                    message: 'Notification deleted'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete notification'
                });
            }
        });
        /**
         * Delete all notifications for user
         */
        this.deleteAllNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const count = yield this.notificationService.deleteAllNotifications(userId);
                res.json({
                    success: true,
                    message: `${count} notifications deleted`
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete notifications'
                });
            }
        });
        this.notificationService = new notificationService_1.NotificationService();
    }
}
exports.NotificationController = NotificationController;

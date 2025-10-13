"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const notificationController = new notificationController_1.NotificationController();
// Routes
router.get('/', authMiddleware_1.requireAuth, notificationController.getUserNotifications);
router.get('/unread-count', authMiddleware_1.requireAuth, notificationController.getUnreadCount);
router.patch('/:notificationId/read', authMiddleware_1.requireAuth, notificationController.markAsRead);
router.patch('/read-all', authMiddleware_1.requireAuth, notificationController.markAllAsRead);
router.delete('/:notificationId', authMiddleware_1.requireAuth, notificationController.deleteNotification);
router.delete('/', authMiddleware_1.requireAuth, notificationController.deleteAllNotifications);
exports.default = router;

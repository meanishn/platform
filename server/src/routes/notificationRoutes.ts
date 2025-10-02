import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

// Routes
router.get('/', requireAuth, notificationController.getUserNotifications);
router.get('/unread-count', requireAuth, notificationController.getUnreadCount);
router.patch('/:notificationId/read', requireAuth, notificationController.markAsRead);
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);
router.delete('/:notificationId', requireAuth, notificationController.deleteNotification);
router.delete('/', requireAuth, notificationController.deleteAllNotifications);

export default router;

import { Router } from 'express';
import authRoutes from './authRoutes';
import providerRoutes from './providerRoutes';
import requestRoutes from './requestRoutes';
import reviewRoutes from './reviewRoutes';
import notificationRoutes from './notificationRoutes';
import serviceRoutes from './serviceRoutes';
import adminRoutes from './adminRoutes';
import customerRoutes from './customerRoutes';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/service-categories', serviceRoutes); // GET service categories and tiers
router.use('/service-requests', requestRoutes); // Service request CRUD
router.use('/providers', providerRoutes); // Provider assignments and dashboard
router.use('/customers', customerRoutes); // Customer dashboard
router.use('/reviews', reviewRoutes); // Review system
router.use('/notifications', notificationRoutes); // Notification management
router.use('/admin', adminRoutes); // Admin management

// Generic dashboard (role-based routing)
router.get('/dashboard/stats', requireAuth, dashboardController.getDashboardStats);

export default router;

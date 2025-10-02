import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { dashboardController } from '../controllers/dashboardController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Provider management
router.get('/providers/pending', adminController.getPendingProviders);
router.get('/providers/:id', adminController.getProviderDetails);
router.patch('/providers/:id/approve', adminController.approveProvider);
router.patch('/providers/:id/reject', adminController.rejectProvider);
router.patch('/providers/:id/suspend', adminController.suspendProvider);
router.patch('/providers/:id/reactivate', adminController.reactivateProvider);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Dashboard
router.get('/dashboard/stats', dashboardController.getAdminStats);
router.get('/dashboard/activity', dashboardController.getAdminActivity);

export default router;



import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { dashboardController } from '../controllers/dashboardController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

/**
 * USER MANAGEMENT ROUTES
 */
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

/**
 * PROVIDER MANAGEMENT ROUTES
 */
router.get('/providers/pending', adminController.getPendingProviders);
router.get('/providers/:id', adminController.getProviderDetails);
router.patch('/providers/:id/approve', adminController.approveProvider);
router.patch('/providers/:id/reject', adminController.rejectProvider);
router.patch('/providers/:id/suspend', adminController.suspendProvider);
router.patch('/providers/:id/reactivate', adminController.reactivateProvider);

/**
 * SERVICE REQUEST DEBUGGING ROUTES
 */
// Get all eligible providers for a request with matching metadata
// Useful for debugging matching algorithm, seeing scores/distances/ranks
router.get('/requests/:id/eligible-providers', adminController.getEligibleProviders);

/**
 * ANALYTICS ROUTES
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * DASHBOARD ROUTES
 */
router.get('/dashboard/stats', dashboardController.getAdminStats);
router.get('/dashboard/activity', dashboardController.getAdminActivity);

export default router;



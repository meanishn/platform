import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Customer dashboard
router.get('/dashboard/stats', requireAuth, dashboardController.getCustomerStats);
router.get('/dashboard/activity', requireAuth, dashboardController.getCustomerActivity);

export default router;



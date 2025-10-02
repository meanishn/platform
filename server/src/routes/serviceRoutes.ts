import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const serviceController = new ServiceController();

// Public routes
router.get('/categories', serviceController.getCategories);
router.get('/categories/:categoryId/tiers', serviceController.getCategoryTiers);

// Admin routes
router.post('/categories', requireAdmin, serviceController.createCategory);
router.patch('/categories/:categoryId', requireAdmin, serviceController.updateCategory);
router.post('/tiers', requireAdmin, serviceController.createTier);
router.patch('/tiers/:tierId', requireAdmin, serviceController.updateTier);

export default router;

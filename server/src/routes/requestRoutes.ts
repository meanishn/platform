import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { requireAuth, requireApprovedProvider } from '../middleware/authMiddleware';

const router = Router();

// Service request management
router.post('/', requireAuth, requestController.createRequest);
router.get('/', requireAuth, requestController.getUserRequests);

// Get assigned provider info (must be before /:id to avoid catch-all)
router.get('/:id/assigned-provider', requireAuth, requestController.getAssignedProvider);

// Get accepted providers (must be before /:id to avoid catch-all)
router.get('/:id/accepted-providers', requireAuth, requestController.getAcceptedProviders);

// Get specific request (generic route, should be after specific routes)
router.get('/:id', requireAuth, requestController.getRequest);

// Request actions
router.patch('/:id/cancel', requireAuth, requestController.cancelRequest);
router.post('/:id/confirm', requireAuth, requestController.confirmProvider);

// Provider job management
router.patch('/:id/start', requireApprovedProvider, requestController.startJob);
router.patch('/:id/complete', requireApprovedProvider, requestController.completeJob);

export default router;

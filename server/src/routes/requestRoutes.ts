import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { requireAuth, requireApprovedProvider } from '../middleware/authMiddleware';

const router = Router();

// Service request management
router.post('/', requireAuth, requestController.createRequest);
router.get('/', requireAuth, requestController.getUserRequests);
router.get('/:id', requireAuth, requestController.getRequest);
router.patch('/:id/cancel', requireAuth, requestController.cancelRequest);
router.post('/:id/confirm', requireAuth, requestController.confirmProvider);
router.get('/:id/accepted-providers', requireAuth, requestController.getAcceptedProviders);

// Provider job management
router.patch('/:id/start', requireApprovedProvider, requestController.startJob);
router.patch('/:id/complete', requireApprovedProvider, requestController.completeJob);

// Get assigned provider info
router.get('/:requestId/assigned-provider', requireAuth, requestController.getAssignedProvider);

export default router;

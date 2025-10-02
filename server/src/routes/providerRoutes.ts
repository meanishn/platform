import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { dashboardController } from '../controllers/dashboardController';
import { requireApprovedProvider } from '../middleware/authMiddleware';

const router = Router();

// Provider assignments (new assignment-based model)
router.get('/assignments', requireApprovedProvider, requestController.getProviderAssignments);
router.patch('/assignments/accept', requireApprovedProvider, requestController.acceptAssignment);
router.patch('/assignments/decline', requireApprovedProvider, requestController.declineAssignment);

// Provider dashboard
router.get('/dashboard/stats', requireApprovedProvider, dashboardController.getProviderStats);
router.get('/dashboard/requests', requireApprovedProvider, dashboardController.getProviderActivity);

export default router;

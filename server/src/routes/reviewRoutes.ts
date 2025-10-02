import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const reviewController = new ReviewController();

// Routes
router.post('/:requestId', requireAuth, reviewController.createReview);
router.get('/provider/:providerId', reviewController.getProviderReviews);
router.get('/provider/:providerId/stats', reviewController.getProviderStats);
router.get('/request/:requestId', reviewController.getRequestReview);
router.get('/request/:requestId/can-review', requireAuth, reviewController.canReview);
router.get('/my-reviews', requireAuth, reviewController.getUserReviews);

export default router;

import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const reviewController = new ReviewController();

// Create review
router.post('/:requestId', requireAuth, reviewController.createReview);

// Get reviews for a specific user (provider or customer)
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/user/:userId/stats', reviewController.getUserStats);

// Get reviews for a specific request (bidirectional)
router.get('/request/:requestId', reviewController.getRequestReviews);

// Check if user can review
router.get('/request/:requestId/can-review', requireAuth, reviewController.canReview);

// Get reviews given by current user
router.get('/my-reviews', requireAuth, reviewController.getMyReviews);

export default router;

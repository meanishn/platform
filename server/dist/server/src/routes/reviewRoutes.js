"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const reviewController = new reviewController_1.ReviewController();
// Routes
router.post('/:requestId', authMiddleware_1.requireAuth, reviewController.createReview);
router.get('/provider/:providerId', reviewController.getProviderReviews);
router.get('/provider/:providerId/stats', reviewController.getProviderStats);
router.get('/request/:requestId', reviewController.getRequestReview);
router.get('/request/:requestId/can-review', authMiddleware_1.requireAuth, reviewController.canReview);
router.get('/my-reviews', authMiddleware_1.requireAuth, reviewController.getUserReviews);
exports.default = router;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const reviewService_1 = require("../services/reviewService");
const express_validator_1 = require("express-validator");
class ReviewController {
    constructor() {
        /**
         * Create a review for a completed job
         */
        this.createReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ success: false, errors: errors.array() });
                }
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { requestId } = req.params;
                const { rating, comment, criteriaRatings, isPublic } = req.body;
                const review = yield this.reviewService.createReview({
                    requestId: parseInt(requestId),
                    reviewerId: userId,
                    rating,
                    comment,
                    criteriaRatings,
                    isPublic
                });
                res.status(201).json({
                    success: true,
                    message: 'Review created successfully',
                    data: review
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Review creation failed'
                });
            }
        });
        /**
         * Get reviews for a provider
         */
        this.getProviderReviews = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { providerId } = req.params;
                const { limit = 10, offset = 0 } = req.query;
                const result = yield this.reviewService.getProviderReviews(parseInt(providerId), parseInt(limit), parseInt(offset));
                res.json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get reviews'
                });
            }
        });
        /**
         * Get provider rating statistics
         */
        this.getProviderStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { providerId } = req.params;
                const stats = yield this.reviewService.getProviderRatingStats(parseInt(providerId));
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get stats'
                });
            }
        });
        /**
         * Get review for a specific request
         */
        this.getRequestReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                const review = yield this.reviewService.getReviewByRequestId(parseInt(requestId));
                if (!review) {
                    return res.status(404).json({ success: false, message: 'Review not found' });
                }
                res.json({
                    success: true,
                    data: review
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get review'
                });
            }
        });
        /**
         * Check if user can review a request
         */
        this.canReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { requestId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const canReview = yield this.reviewService.canReview(parseInt(requestId), userId);
                res.json({
                    success: true,
                    data: { canReview }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Check failed'
                });
            }
        });
        /**
         * Get user's given reviews
         */
        this.getUserReviews = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const reviews = yield this.reviewService.getUserReviews(userId);
                res.json({
                    success: true,
                    data: reviews
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get reviews'
                });
            }
        });
        this.reviewService = new reviewService_1.ReviewService();
    }
}
exports.ReviewController = ReviewController;

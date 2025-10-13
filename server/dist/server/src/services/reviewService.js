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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const User_1 = __importDefault(require("../models/User"));
class ReviewService {
    /**
     * Create a review for a completed job
     */
    createReview(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if request exists and is completed
            const request = yield ServiceRequest_1.default.query().findById(data.requestId);
            if (!request)
                throw new Error('Request not found');
            if (request.status !== 'completed')
                throw new Error('Can only review completed jobs');
            if (request.user_id !== data.reviewerId)
                throw new Error('Only job owner can leave a review');
            if (!request.assigned_provider_id)
                throw new Error('No provider assigned for this job');
            // Check if review already exists
            const existingReview = yield Review_1.default.query().where('request_id', data.requestId).first();
            if (existingReview)
                throw new Error('Review already exists for this job');
            // Validate rating
            if (data.rating < 1 || data.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            // Create review
            const review = yield Review_1.default.query().insertAndFetch({
                request_id: data.requestId,
                reviewer_id: data.reviewerId,
                reviewee_id: request.assigned_provider_id,
                rating: data.rating,
                comment: data.comment,
                criteria_ratings: data.criteriaRatings,
                is_public: data.isPublic !== false // Default to true
            });
            // Update provider's average rating
            yield this.updateProviderRating(request.assigned_provider_id);
            return review;
        });
    }
    /**
     * Get reviews for a provider
     */
    getProviderReviews(providerId_1) {
        return __awaiter(this, arguments, void 0, function* (providerId, limit = 10, offset = 0) {
            // Get reviews
            const reviews = yield Review_1.default.query()
                .where('reviewee_id', providerId)
                .where('is_public', true)
                .withGraphFetched('[reviewer, request]')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset(offset);
            // Get total count
            const totalResult = yield Review_1.default.query()
                .where('reviewee_id', providerId)
                .where('is_public', true)
                .count('* as count')
                .first();
            const total = parseInt((totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) || '0');
            // Get statistics
            const stats = yield this.getProviderRatingStats(providerId);
            return {
                reviews,
                total,
                stats
            };
        });
    }
    /**
     * Get provider rating statistics
     */
    getProviderRatingStats(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reviews = yield Review_1.default.query()
                .where('reviewee_id', providerId)
                .where('is_public', true)
                .select('rating');
            const totalReviews = reviews.length;
            if (totalReviews === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.forEach(review => {
                if (review.rating >= 1 && review.rating <= 5) {
                    ratingDistribution[review.rating]++;
                }
            });
            return {
                averageRating: Math.round(averageRating * 100) / 100,
                totalReviews,
                ratingDistribution
            };
        });
    }
    /**
     * Update provider's average rating
     */
    updateProviderRating(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.getProviderRatingStats(providerId);
            yield User_1.default.query()
                .patchAndFetchById(providerId, {
                average_rating: stats.averageRating
            });
        });
    }
    /**
     * Get review by request ID
     */
    getReviewByRequestId(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Review_1.default.query()
                .where('request_id', requestId)
                .withGraphFetched('[reviewer, reviewee, request]')
                .first();
        });
    }
    /**
     * Check if user can review a request
     */
    canReview(requestId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
            if (!request)
                return false;
            if (request.status !== 'completed')
                return false;
            if (request.user_id !== userId)
                return false;
            const existingReview = yield Review_1.default.query().where('request_id', requestId).first();
            return !existingReview;
        });
    }
    /**
     * Get user's given reviews
     */
    getUserReviews(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Review_1.default.query()
                .where('reviewer_id', userId)
                .withGraphFetched('[reviewee, request]')
                .orderBy('created_at', 'desc');
        });
    }
}
exports.ReviewService = ReviewService;

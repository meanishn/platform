"use strict";
/**
 * Review Sanitizer
 * Handles all review-related data sanitization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReviewDto = toReviewDto;
exports.toReviewDetailDto = toReviewDetailDto;
exports.toProviderRatingStatsDto = toProviderRatingStatsDto;
exports.toReviewDtoArray = toReviewDtoArray;
exports.toReviewDetailDtoArray = toReviewDetailDtoArray;
const base_sanitizer_1 = require("./base.sanitizer");
const user_sanitizer_1 = require("./user.sanitizer");
/**
 * Convert Review model to ReviewDto
 */
function toReviewDto(review) {
    return {
        id: review.id,
        requestId: review.request_id,
        reviewerId: review.reviewer_id,
        revieweeId: review.reviewee_id,
        rating: review.rating,
        comment: review.comment,
        criteriaRatings: review.criteria_ratings,
        isPublic: review.is_public,
        createdAt: review.created_at
    };
}
/**
 * Convert Review with relations to ReviewDetailDto
 */
function toReviewDetailDto(review) {
    if (!review.reviewer || !review.reviewee) {
        throw new Error('Review must include reviewer and reviewee relations');
    }
    return Object.assign(Object.assign({}, toReviewDto(review)), { reviewer: (0, user_sanitizer_1.toPublicUserDto)(review.reviewer), reviewee: (0, user_sanitizer_1.toPublicUserDto)(review.reviewee) });
}
/**
 * Convert rating statistics to DTO
 */
function toProviderRatingStatsDto(stats) {
    var _a, _b, _c, _d, _e;
    return {
        averageRating: stats.averageRating || 0,
        totalReviews: stats.totalReviews || 0,
        ratingDistribution: {
            1: ((_a = stats.ratingDistribution) === null || _a === void 0 ? void 0 : _a[1]) || 0,
            2: ((_b = stats.ratingDistribution) === null || _b === void 0 ? void 0 : _b[2]) || 0,
            3: ((_c = stats.ratingDistribution) === null || _c === void 0 ? void 0 : _c[3]) || 0,
            4: ((_d = stats.ratingDistribution) === null || _d === void 0 ? void 0 : _d[4]) || 0,
            5: ((_e = stats.ratingDistribution) === null || _e === void 0 ? void 0 : _e[5]) || 0
        },
        criteriaAverages: stats.criteriaAverages
    };
}
/**
 * Sanitize array of reviews to DTOs
 */
function toReviewDtoArray(reviews) {
    return (0, base_sanitizer_1.sanitizeArray)(reviews, toReviewDto);
}
/**
 * Sanitize array of reviews to detail DTOs
 */
function toReviewDetailDtoArray(reviews) {
    return (0, base_sanitizer_1.sanitizeArray)(reviews, toReviewDetailDto);
}

/**
 * Review Sanitizer
 * Handles all review-related data sanitization
 */

import Review from '../models/Review';
import {
  ReviewDto,
  ReviewDetailDto,
  ProviderRatingStatsDto
} from '../shared/dtos/review.dto';
import { sanitizeArray } from './base.sanitizer';
import { toPublicUserDto } from './user.sanitizer';

/**
 * Convert Review model to ReviewDto
 */
export function toReviewDto(review: Review | any): ReviewDto {
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
export function toReviewDetailDto(review: Review | any): ReviewDetailDto {
  if (!review.reviewer || !review.reviewee) {
    throw new Error('Review must include reviewer and reviewee relations');
  }

  return {
    ...toReviewDto(review),
    reviewer: toPublicUserDto(review.reviewer),
    reviewee: toPublicUserDto(review.reviewee)
  };
}

/**
 * Convert rating statistics to DTO
 */
export function toProviderRatingStatsDto(stats: any): ProviderRatingStatsDto {
  return {
    averageRating: stats.averageRating || 0,
    totalReviews: stats.totalReviews || 0,
    ratingDistribution: {
      1: stats.ratingDistribution?.[1] || 0,
      2: stats.ratingDistribution?.[2] || 0,
      3: stats.ratingDistribution?.[3] || 0,
      4: stats.ratingDistribution?.[4] || 0,
      5: stats.ratingDistribution?.[5] || 0
    },
    criteriaAverages: stats.criteriaAverages
  };
}

/**
 * Sanitize array of reviews to DTOs
 */
export function toReviewDtoArray(reviews: Review[]): ReviewDto[] {
  return sanitizeArray(reviews, toReviewDto);
}

/**
 * Sanitize array of reviews to detail DTOs
 */
export function toReviewDetailDtoArray(reviews: Review[]): ReviewDetailDto[] {
  return sanitizeArray(reviews, toReviewDetailDto);
}


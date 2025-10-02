/**
 * Review Data Transfer Objects
 */

import { PublicUserDto } from './user.dto';

export interface ReviewDto {
  id: number;
  requestId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
  criteriaRatings?: Record<string, number>;
  isPublic: boolean;
  createdAt: string;
}

export interface ReviewDetailDto extends ReviewDto {
  reviewer: PublicUserDto;
  reviewee: PublicUserDto;
}

export interface ProviderRatingStatsDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  criteriaAverages?: Record<string, number>;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
  criteriaRatings?: Record<string, number>;
  isPublic?: boolean;
}


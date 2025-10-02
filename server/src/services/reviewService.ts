import Review from '../models/Review';
import ServiceRequest from '../models/ServiceRequest';
import User from '../models/User';
import { raw } from 'objection';

export interface CreateReviewData {
  requestId: number;
  reviewerId: number;
  rating: number;
  comment?: string;
  criteriaRatings?: {
    quality?: number;
    timeliness?: number;
    communication?: number;
    professionalism?: number;
    value?: number;
  };
  isPublic?: boolean;
}

export class ReviewService {
  
  /**
   * Create a review for a completed job
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    // Check if request exists and is completed
    const request = await ServiceRequest.query().findById(data.requestId);
    if (!request) throw new Error('Request not found');
    if (request.status !== 'completed') throw new Error('Can only review completed jobs');
    if (request.user_id !== data.reviewerId) throw new Error('Only job owner can leave a review');
    if (!request.assigned_provider_id) throw new Error('No provider assigned for this job');

    // Check if review already exists
    const existingReview = await Review.query().where('request_id', data.requestId).first();
    if (existingReview) throw new Error('Review already exists for this job');

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create review
    const review = await Review.query().insertAndFetch({
      request_id: data.requestId,
      reviewer_id: data.reviewerId,
      reviewee_id: request.assigned_provider_id,
      rating: data.rating,
      comment: data.comment,
      criteria_ratings: data.criteriaRatings,
      is_public: data.isPublic !== false // Default to true
    });

    // Update provider's average rating
    await this.updateProviderRating(request.assigned_provider_id);

    return review;
  }

  /**
   * Get reviews for a provider
   */
  async getProviderReviews(providerId: number, limit = 10, offset = 0): Promise<{
    reviews: Review[];
    total: number;
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { [key: number]: number };
    };
  }> {
    // Get reviews
    const reviews = await Review.query()
      .where('reviewee_id', providerId)
      .where('is_public', true)
      .withGraphFetched('[reviewer, request]')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await Review.query()
      .where('reviewee_id', providerId)
      .where('is_public', true)
      .count('* as count')
      .first();
    const total = parseInt((totalResult as any)?.count || '0');

    // Get statistics
    const stats = await this.getProviderRatingStats(providerId);

    return {
      reviews,
      total,
      stats
    };
  }

  /**
   * Get provider rating statistics
   */
  async getProviderRatingStats(providerId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await Review.query()
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
    
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
  }

  /**
   * Update provider's average rating
   */
  private async updateProviderRating(providerId: number): Promise<void> {
    const stats = await this.getProviderRatingStats(providerId);
    
    await User.query()
      .patchAndFetchById(providerId, {
        average_rating: stats.averageRating
      });
  }

  /**
   * Get review by request ID
   */
  async getReviewByRequestId(requestId: number): Promise<Review | undefined> {
    return Review.query()
      .where('request_id', requestId)
      .withGraphFetched('[reviewer, reviewee, request]')
      .first();
  }

  /**
   * Check if user can review a request
   */
  async canReview(requestId: number, userId: number): Promise<boolean> {
    const request = await ServiceRequest.query().findById(requestId);
    if (!request) return false;
    if (request.status !== 'completed') return false;
    if (request.user_id !== userId) return false;

    const existingReview = await Review.query().where('request_id', requestId).first();
    return !existingReview;
  }

  /**
   * Get user's given reviews
   */
  async getUserReviews(userId: number): Promise<Review[]> {
    return Review.query()
      .where('reviewer_id', userId)
      .withGraphFetched('[reviewee, request]')
      .orderBy('created_at', 'desc');
  }
}

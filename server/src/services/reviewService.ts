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
   * Create a review for a completed job (bidirectional: customer can review provider, provider can review customer)
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    // Check if request exists and is completed
    const request = await ServiceRequest.query().findById(data.requestId);
    if (!request) throw new Error('Request not found');
    if (request.status !== 'completed') throw new Error('Can only review completed jobs');
    if (!request.assigned_provider_id) throw new Error('No provider assigned for this job');

    // Determine reviewer and reviewee
    const isCustomer = request.user_id === data.reviewerId;
    const isProvider = request.assigned_provider_id === data.reviewerId;

    if (!isCustomer && !isProvider) {
      throw new Error('Only the customer or assigned provider can leave a review');
    }

    // Determine reviewee ID
    const revieweeId = isCustomer ? request.assigned_provider_id : request.user_id;

    // Check if this user has already reviewed
    const existingReview = await Review.query()
      .where('request_id', data.requestId)
      .where('reviewer_id', data.reviewerId)
      .first();
    
    if (existingReview) {
      throw new Error('You have already reviewed this job');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create review
    const review = await Review.query().insertAndFetch({
      request_id: data.requestId,
      reviewer_id: data.reviewerId,
      reviewee_id: revieweeId,
      rating: data.rating,
      comment: data.comment,
      criteria_ratings: data.criteriaRatings,
      is_public: data.isPublic !== false // Default to true
    });

    // Fetch relations for return
    const reviewWithRelations = await Review.query()
      .findById(review.id)
      .withGraphFetched('[reviewer, reviewee]');

    // Update reviewee's average rating
    await this.updateUserRating(revieweeId);

    return reviewWithRelations!;
  }

  /**
   * Get reviews for a user (provider or customer)
   */
  async getUserReviews(userId: number, limit = 10, offset = 0): Promise<{
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
      .where('reviewee_id', userId)
      .where('is_public', true)
      .withGraphFetched('[reviewer, reviewee]')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await Review.query()
      .where('reviewee_id', userId)
      .where('is_public', true)
      .count('* as count')
      .first();
    const total = parseInt((totalResult as any)?.count || '0');

    // Get statistics
    const stats = await this.getUserRatingStats(userId);

    return {
      reviews,
      total,
      stats
    };
  }

  /**
   * Get user rating statistics (works for both providers and customers)
   */
  async getUserRatingStats(userId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await Review.query()
      .where('reviewee_id', userId)
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
   * Update user's average rating (works for both providers and customers)
   */
  private async updateUserRating(userId: number): Promise<void> {
    const stats = await this.getUserRatingStats(userId);
    
    await User.query()
      .patchAndFetchById(userId, {
        average_rating: stats.averageRating
      });
  }

  /**
   * Get all reviews for a request (bidirectional)
   */
  async getReviewsByRequestId(requestId: number): Promise<Review[]> {
    return Review.query()
      .where('request_id', requestId)
      .withGraphFetched('[reviewer, reviewee]')
      .orderBy('created_at', 'desc');
  }

  /**
   * Check if user can review a request (bidirectional)
   */
  async canUserReview(requestId: number, userId: number): Promise<{ canReview: boolean; reason?: string }> {
    const request = await ServiceRequest.query().findById(requestId);
    
    if (!request) {
      return { canReview: false, reason: 'Request not found' };
    }
    
    if (request.status !== 'completed') {
      return { canReview: false, reason: 'Can only review completed jobs' };
    }

    const isCustomer = request.user_id === userId;
    const isProvider = request.assigned_provider_id === userId;

    if (!isCustomer && !isProvider) {
      return { canReview: false, reason: 'You are not part of this request' };
    }

    if (!request.assigned_provider_id) {
      return { canReview: false, reason: 'No provider assigned to this job' };
    }

    // Check if user has already reviewed
    const existingReview = await Review.query()
      .where('request_id', requestId)
      .where('reviewer_id', userId)
      .first();
    
    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this job' };
    }

    return { canReview: true };
  }

  /**
   * Get reviews given by a user
   */
  async getReviewsGivenByUser(userId: number): Promise<Review[]> {
    return Review.query()
      .where('reviewer_id', userId)
      .withGraphFetched('[reviewee, reviewer]')
      .orderBy('created_at', 'desc');
  }
}

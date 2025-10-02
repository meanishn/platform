import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { validationResult } from 'express-validator';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Create a review for a completed job
   */
  createReview = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { requestId } = req.params;
      const { rating, comment, criteriaRatings, isPublic } = req.body;

      const review = await this.reviewService.createReview({
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Review creation failed'
      });
    }
  };

  /**
   * Get reviews for a provider
   */
  getProviderReviews = async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const result = await this.reviewService.getProviderReviews(
        parseInt(providerId),
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get reviews'
      });
    }
  };

  /**
   * Get provider rating statistics
   */
  getProviderStats = async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;

      const stats = await this.reviewService.getProviderRatingStats(parseInt(providerId));

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      });
    }
  };

  /**
   * Get review for a specific request
   */
  getRequestReview = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const review = await this.reviewService.getReviewByRequestId(parseInt(requestId));

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get review'
      });
    }
  };

  /**
   * Check if user can review a request
   */
  canReview = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const canReview = await this.reviewService.canReview(parseInt(requestId), userId);

      res.json({
        success: true,
        data: { canReview }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Check failed'
      });
    }
  };

  /**
   * Get user's given reviews
   */
  getUserReviews = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const reviews = await this.reviewService.getUserReviews(userId);

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get reviews'
      });
    }
  };
}

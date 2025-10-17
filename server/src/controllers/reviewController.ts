import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { validationResult } from 'express-validator';
import { toReviewDetailDto, toReviewDetailDtoArray, toProviderRatingStatsDto } from '../sanitizers/review.sanitizer';
import type { ApiResponse } from '../../../shared-types/api';
import type { ReviewDetailDto, ProviderRatingStatsDto, CreateReviewDto } from '../../../shared-types/review';

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
      const reviewData: CreateReviewDto = {
        rating: req.body.rating,
        comment: req.body.comment,
        criteriaRatings: req.body.criteriaRatings,
        isPublic: req.body.isPublic
      };

      const review = await this.reviewService.createReview({
        requestId: parseInt(requestId),
        reviewerId: userId,
        ...reviewData
      });

      const sanitizedReview = toReviewDetailDto(review);

      const response: ApiResponse<ReviewDetailDto> = {
        success: true,
        message: 'Review created successfully',
        data: sanitizedReview
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Review creation failed'
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get reviews for a user (provider or customer)
   */
  getUserReviews = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const result = await this.reviewService.getUserReviews(
        parseInt(userId),
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const sanitizedReviews = toReviewDetailDtoArray(result.reviews);

      const response: ApiResponse<{ 
        reviews: ReviewDetailDto[]; 
        total: number;
        stats: ProviderRatingStatsDto;
      }> = {
        success: true,
        data: {
          reviews: sanitizedReviews,
          total: result.total,
          stats: toProviderRatingStatsDto(result.stats)
        }
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get reviews'
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get user rating statistics
   */
  getUserStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const stats = await this.reviewService.getUserRatingStats(parseInt(userId));

      const response: ApiResponse<ProviderRatingStatsDto> = {
        success: true,
        data: toProviderRatingStatsDto(stats)
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get reviews for a specific request (bidirectional)
   */
  getRequestReviews = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const reviews = await this.reviewService.getReviewsByRequestId(parseInt(requestId));

      const sanitizedReviews = toReviewDetailDtoArray(reviews);

      const response: ApiResponse<ReviewDetailDto[]> = {
        success: true,
        data: sanitizedReviews
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get reviews'
      };
      res.status(400).json(response);
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

      const canReviewResult = await this.reviewService.canUserReview(parseInt(requestId), userId);

      const response: ApiResponse<{ canReview: boolean; reason?: string }> = {
        success: true,
        data: canReviewResult
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Check failed'
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get reviews given by a user
   */
  getMyReviews = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const reviews = await this.reviewService.getReviewsGivenByUser(userId);

      const sanitizedReviews = toReviewDetailDtoArray(reviews);

      const response: ApiResponse<ReviewDetailDto[]> = {
        success: true,
        data: sanitizedReviews
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get reviews'
      };
      res.status(400).json(response);
    }
  };
}

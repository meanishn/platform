/**
 * SubmitReviewModal Component
 * 
 * Modal for submitting a review with star rating and comment.
 * Follows DESIGN_SYSTEM.md with proper form styling and validation.
 */

import React, { useState, useEffect } from 'react';
import { Modal, StarRating, Button, Textarea } from './index';
import { Star, CheckCircle2 } from 'lucide-react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  revieweeName: string;
  isSubmitting?: boolean;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  revieweeName,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rating
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setError('');
      await onSubmit(rating, comment);
      // Show success message
      setIsSuccess(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  // Reset success state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Review ${revieweeName}`}
      size="md"
      theme="light"
    >
      {isSuccess ? (
        /* Success Message */
        <div className="py-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Review Submitted Successfully!
          </h3>
          <p className="text-sm text-slate-600">
            Thank you for your feedback. This modal will close automatically.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rating <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
                readonly={false}
              />
              {rating > 0 && (
                <span className="text-sm font-medium text-slate-900">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
            {error && rating === 0 && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Comment Section */}
          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && rating !== 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || rating === 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};


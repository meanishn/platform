/**
 * ReviewModal Component
 * 
 * Displays reviews for a request or user in a modal.
 * Follows DESIGN_SYSTEM.md with clean layout and proper spacing.
 */

import React from 'react';
import { Modal, StarRating, EmptyState } from './index';
import type { ReviewDetailDto } from '../../types/api';
import { MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewDetailDto[];
  title?: string;
  isLoading?: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  reviews,
  title = 'Reviews',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      theme="light"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="There are no reviews to display."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </Modal>
  );
};

interface ReviewCardProps {
  review: ReviewDetailDto;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const reviewerName = `${review.reviewer.firstName} ${review.reviewer.lastName}`;
  const revieweeName = `${review.reviewee.firstName} ${review.reviewee.lastName}`;
  const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {reviewerName}
            </p>
            <span className="text-xs text-slate-500">→</span>
            <p className="text-sm text-slate-600 truncate">
              {revieweeName}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {reviewDate}
          </p>
        </div>
        <div className="flex-shrink-0">
          <StarRating rating={review.rating} readonly size="sm" />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mt-3 pt-3 border-t border-slate-200/60">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>
      )}
    </div>
  );
};


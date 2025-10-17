/**
 * ProviderInfoCard Component
 * 
 * Displays assigned provider information with confirmation actions.
 * Shows provider details, rating, and action buttons for confirmation/rejection.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Card, Button, StarRating } from '../ui';
import { Clock, CheckCircle2, Phone, Check, X, User } from 'lucide-react';
import type { ProviderWithContactDto, ReviewDetailDto } from '../../types/api';

export interface ProviderInfoCardProps {
  provider: ProviderWithContactDto;
  status: string;
  isPending: boolean;
  isProcessing: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  onViewReviews?: () => void;
  reviews?: ReviewDetailDto[];
  className?: string;
}

export const ProviderInfoCard: React.FC<ProviderInfoCardProps> = ({
  provider,
  status,
  isPending,
  isProcessing,
  onConfirm,
  onReject,
  onViewReviews,
  reviews = [],
  className = '',
}) => {
  const showConfirmationActions = status === 'pending' && isPending;

  return (
    <Card className={className}>
      <div className="p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
          {showConfirmationActions ? (
            <>
              <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" strokeWidth={2} />
              <span className="leading-tight">Provider Awaiting Your Confirmation</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" strokeWidth={2} />
              <span>Assigned Provider</span>
            </>
          )}
        </h3>
        
        {/* Provider Details Section */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Provider Details
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-lg font-bold border-2 border-slate-300">
                {provider.firstName[0]}{provider.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-base font-semibold text-slate-900">
                  {provider.firstName} {provider.lastName}
                </h5>
                <p className="text-xs text-slate-600">{provider.email}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  <span>{provider.phone}</span>
                </p>
              </div>
            </div>

            {/* Reviews - Simple inline display */}
            <div className="pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={provider.averageRating || 0} readonly size="sm" />
                  <span className="text-xs text-slate-600">
                    {reviews.length > 0 
                      ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
                      : 'No reviews yet'
                    }
                  </span>
                </div>
                {reviews.length > 0 && onViewReviews && (
                  <button
                    onClick={onViewReviews}
                    className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    View reviews
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation actions */}
        {showConfirmationActions && onConfirm && onReject && (
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-purple-700 mb-3 sm:mb-4 bg-purple-50 p-2.5 sm:p-3 rounded leading-relaxed">
              This provider has accepted your request. Please review their profile above and confirm to proceed with the work.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2} />
                      <span>Confirm Provider</span>
                    </>
                  )}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isProcessing}
                className="w-full sm:flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <span className="inline-flex items-center gap-1.5">
                  <X className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Reject & Find Another</span>
                  <span className="sm:hidden">Reject</span>
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};


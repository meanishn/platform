/**
 * ProviderInfoCard Component
 * 
 * Displays assigned provider information with confirmation actions.
 * Shows provider details, rating, and action buttons for confirmation/rejection.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Card, Button, ProviderRating } from '../ui';
import { Clock, CheckCircle2, Phone, Check, X } from 'lucide-react';
import type { ProviderWithContactDto } from '../../types/api';

export interface ProviderInfoCardProps {
  provider: ProviderWithContactDto;
  status: string;
  isPending: boolean;
  isProcessing: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  className?: string;
}

export const ProviderInfoCard: React.FC<ProviderInfoCardProps> = ({
  provider,
  status,
  isPending,
  isProcessing,
  onConfirm,
  onReject,
  className = '',
}) => {
  const showConfirmationActions = status === 'pending' && isPending;

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          {showConfirmationActions ? (
            <>
              <Clock className="w-5 h-5 text-amber-600" strokeWidth={2} />
              <span>Provider Awaiting Your Confirmation</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              <span>Assigned Provider</span>
            </>
          )}
        </h3>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold border-2 border-slate-300">
            {provider.firstName[0]}{provider.lastName[0]}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900">
              {provider.firstName} {provider.lastName}
            </h4>
            <p className="text-slate-600">{provider.email}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-4 h-4" strokeWidth={2} />
              <span>{provider.phone}</span>
            </p>
            {provider.averageRating && provider.averageRating > 0 && (
              <div className="mt-2">
                <ProviderRating
                  rating={provider.averageRating}
                  totalJobs={provider.totalJobsCompleted || 0}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Confirmation actions */}
        {showConfirmationActions && onConfirm && onReject && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-purple-700 mb-4 bg-purple-50 p-3 rounded">
              This provider has accepted your request. Please review their profile above and confirm to proceed with the work.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onConfirm}
                disabled={isProcessing}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <span className="inline-flex items-center gap-1.5">
                  <X className="w-4 h-4" strokeWidth={2} />
                  <span>Reject & Find Another</span>
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};


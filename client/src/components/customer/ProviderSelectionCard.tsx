/**
 * ProviderSelectionCard Component
 * 
 * Card for displaying and selecting a provider from accepted providers list.
 * Encapsulates provider info, stats, badges, and selection action.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Button, Badge, ProviderRating, ProviderStatsGrid } from '../ui';
import type { PublicUserDto } from '../../types/api';
import { Star, Award, CheckCircle } from 'lucide-react';

export interface ProviderSelectionCardProps {
  provider: PublicUserDto;
  isSelected: boolean;
  isConfirming: boolean;
  onSelect: (providerId: number) => void;
}

export const ProviderSelectionCard: React.FC<ProviderSelectionCardProps> = ({
  provider,
  isSelected,
  isConfirming,
  onSelect,
}) => {
  const totalJobs = provider.totalJobsCompleted || 0;
  const rating = provider.averageRating || 0;

  return (
    <div
      className={`border-2 rounded-lg p-5 transition-all ${
        isSelected
          ? 'border-emerald-600 bg-emerald-50'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Provider Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {provider.firstName?.[0]}{provider.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-lg">
            {provider.firstName} {provider.lastName}
          </h4>
          {rating > 0 && (
            <div className="mt-1">
              <ProviderRating
                rating={rating}
                totalJobs={totalJobs}
                size="md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Provider Stats */}
      <ProviderStatsGrid
        stats={[
          {
            label: 'Experience',
            value: `${totalJobs} ${totalJobs === 1 ? 'job' : 'jobs'} completed`,
          },
          {
            label: 'Rating',
            value: rating > 0 ? `${rating.toFixed(1)} / 5.0` : 'No ratings yet',
          },
        ]}
        className="mb-4"
      />

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {totalJobs > 50 && (
          <Badge variant="default" size="sm" className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>Experienced</span>
          </Badge>
        )}
        {rating >= 4.5 && (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>Top Rated</span>
          </Badge>
        )}
        {totalJobs > 0 && totalJobs <= 10 && (
          <Badge variant="info" size="sm">
            New Provider
          </Badge>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onSelect(provider.id)}
        disabled={isConfirming}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2"
      >
        {isConfirming && isSelected ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Confirming...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Select {provider.firstName}</span>
          </>
        )}
      </Button>
    </div>
  );
};


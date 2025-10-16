/**
 * ProviderRating Component
 * 
 * Reusable star rating display for providers.
 * Shows stars, rating value, and job count following design system.
 */

import React from 'react';
import { Star } from 'lucide-react';

export interface ProviderRatingProps {
  rating: number;
  totalJobs?: number;
  size?: 'sm' | 'md' | 'lg';
  showJobCount?: boolean;
}

export const ProviderRating: React.FC<ProviderRatingProps> = ({
  rating,
  totalJobs,
  size = 'md',
  showJobCount = true,
}) => {
  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starNum) => (
          <Star
            key={starNum}
            className={`${starSizes[size]} ${
              starNum <= Math.round(rating)
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 fill-slate-300'
            }`}
          />
        ))}
      </div>
      <span className={`${textSizes[size]} font-medium text-slate-700`}>
        {rating.toFixed(1)}
      </span>
      {showJobCount && totalJobs !== undefined && (
        <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-slate-500`}>
          ({totalJobs} {totalJobs === 1 ? 'job' : 'jobs'})
        </span>
      )}
    </div>
  );
};


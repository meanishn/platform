// client/src/components/provider/CustomerInfoHeader.tsx
// Component for displaying customer avatar, name, and rating
// Used in job details, assignments, and other provider views
// Extracted from JobDetailsModal to standardize customer info display

import React from 'react';
import { Star } from 'lucide-react';

export interface CustomerInfoHeaderProps {
  firstName: string;
  lastName?: string;
  averageRating?: number;
  totalJobsCompleted?: number;
  showFullLastName?: boolean; // Show full last name vs just initial
  className?: string;
}

export const CustomerInfoHeader: React.FC<CustomerInfoHeaderProps> = ({
  firstName,
  lastName,
  averageRating,
  totalJobsCompleted,
  showFullLastName = false,
  className = '',
}) => {
  const displayName = showFullLastName 
    ? `${firstName} ${lastName || ''}`.trim()
    : `${firstName} ${lastName?.[0] ? `${lastName[0]}.` : ''}`.trim();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {firstName?.[0] || 'C'}
      </div>
      <div className="min-w-0">
        <p className="text-slate-900 font-semibold truncate">
          {displayName}
        </p>
        {averageRating !== undefined && (
          <p className="text-slate-600 text-sm flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" strokeWidth={2} />
            {averageRating.toFixed(1)} stars
            {totalJobsCompleted !== undefined && ` (${totalJobsCompleted} jobs)`}
          </p>
        )}
      </div>
    </div>
  );
};


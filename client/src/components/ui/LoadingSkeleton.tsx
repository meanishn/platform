/**
 * LoadingSkeleton Component
 * Reusable loading skeleton for various states
 */

import React from 'react';

export interface LoadingSkeletonProps {
  /** Type of skeleton to display */
  type?: 'page' | 'card' | 'list';
  /** Number of items for list type */
  count?: number;
  /** Additional className */
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'page',
  count = 3,
  className = '',
}) => {
  if (type === 'page') {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
        <div className="h-10 bg-white/10 rounded w-1/2"></div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

/**
 * CenteredLoadingSpinner Component
 * Full-screen centered loading spinner
 */
export const CenteredLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  );
};

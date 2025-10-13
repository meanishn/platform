/**
 * MatchBadge Component
 * Displays provider match quality with score, rank, and distance
 * Visual indicators for top 3 ranks
 */

import React from 'react';

interface MatchBadgeProps {
  score?: number;      // 0-100 match score
  rank?: number;       // 1-based ranking
  distance?: number;   // Distance in miles
  className?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ 
  score, 
  rank, 
  distance,
  className = ''
}) => {
  // If no match data available, don't render
  if (!score && !rank && !distance) {
    return null;
  }

  // Ensure distance is a number
  const distanceNum = distance !== undefined ? Number(distance) : undefined;

  // Get rank emoji
  const getRankEmoji = () => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  // Get rank text
  const getRankText = () => {
    if (rank === 1) return 'BEST MATCH';
    if (rank === 2) return 'GREAT MATCH';
    if (rank === 3) return 'GOOD MATCH';
    return `#${rank}`;
  };

  // Get badge background classes based on rank
  const getBadgeClasses = () => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-500/40 to-orange-500/40 border-yellow-500/60 shadow-lg shadow-yellow-500/30 animate-pulse-subtle';
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-gray-400/40 to-gray-500/40 border-gray-400/60';
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-orange-700/40 to-orange-800/40 border-orange-700/60';
    }
    return 'bg-white/15 border-white/30';
  };

  // Get rank text color
  const getRankTextColor = () => {
    if (rank === 1) return 'text-yellow-300';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-300';
    return 'text-white/90';
  };

  // Get score color classes
  const getScoreClasses = () => {
    if (!score) return 'bg-white/20';
    if (score >= 90) return 'bg-green-500/30 text-green-300';
    if (score >= 75) return 'bg-blue-500/30 text-blue-300';
    if (score >= 60) return 'bg-yellow-500/30 text-yellow-300';
    return 'bg-gray-500/30 text-gray-300';
  };

  return (
    <div className={`
      inline-flex items-center justify-center 
      px-3 py-2 md:px-4 md:py-2.5
      rounded-2xl
      backdrop-blur-md
      border
      shadow-md
      text-xs md:text-sm
      font-semibold
      transition-all duration-300
      hover:shadow-xl hover:-translate-y-0.5
      ${getBadgeClasses()}
      ${className}
    `}>
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* Rank Indicator */}
        {rank && (
          <div className="flex items-center gap-1">
            <span className="text-base md:text-lg">{getRankEmoji()}</span>
            <span className={`font-bold uppercase tracking-wide ${getRankTextColor()}`}>
              {getRankText()}
            </span>
          </div>
        )}

        {/* Score */}
        {score !== undefined && (
          <div className={`
            flex items-center 
            px-2 py-0.5 
            rounded-lg 
            font-bold
            ${getScoreClasses()}
          `}>
            {score}%
          </div>
        )}

        {/* Distance */}
        {distanceNum !== undefined && !isNaN(distanceNum) && (
          <div className="flex items-center gap-1 text-white/90">
            <span className="text-sm">📍</span>
            <span className="font-semibold">
              {distanceNum < 1 
                ? `${(distanceNum * 5280).toFixed(0)} ft` 
                : `${distanceNum.toFixed(1)} mi`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized compact version
export const CompactMatchBadge: React.FC<MatchBadgeProps> = ({ 
  score, 
  rank, 
  distance,
  className = ''
}) => {
  if (!score && !rank && !distance) return null;

  // Ensure distance is a number
  const distanceNum = distance !== undefined ? Number(distance) : undefined;

  const getRankEmoji = () => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      px-2 py-1
      rounded-xl
      bg-white/15 
      backdrop-blur-sm
      border border-white/25
      text-[0.6875rem]
      font-semibold
      text-white/95
      ${className}
    `}>
      {rank && <span className="flex items-center">{getRankEmoji()}</span>}
      {score !== undefined && <span className="whitespace-nowrap">{score}%</span>}
      {distanceNum !== undefined && !isNaN(distanceNum) && (
        <span className="flex items-center whitespace-nowrap">
          📍 {distanceNum < 1 ? `${(distanceNum * 5280).toFixed(0)}ft` : `${distanceNum.toFixed(1)}mi`}
        </span>
      )}
    </div>
  );
};

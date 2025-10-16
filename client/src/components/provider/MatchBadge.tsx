/**
 * MatchBadge Component
 * Displays provider match quality with score, rank, and distance
 * Visual indicators for top 3 ranks - Following Design System v1.0
 */

import React from 'react';
import { Trophy, Award, Medal, BarChart3, MapPin } from 'lucide-react';

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

  // Get rank icon component
  const getRankIcon = () => {
    if (rank === 1) return Trophy;
    if (rank === 2) return Award;
    if (rank === 3) return Medal;
    return BarChart3;
  };

  // Get rank text
  const getRankText = () => {
    if (rank === 1) return 'BEST MATCH';
    if (rank === 2) return 'GREAT MATCH';
    if (rank === 3) return 'GOOD MATCH';
    return `#${rank}`;
  };

  // Get badge background classes based on rank - Design System compliant (subtle version)
  const getBadgeClasses = () => {
    if (rank === 1) {
      return 'bg-white border-amber-200';
    }
    if (rank === 2) {
      return 'bg-white border-slate-200';
    }
    if (rank === 3) {
      return 'bg-white border-orange-200';
    }
    return 'bg-white border-slate-200';
  };

  // Get rank text color - Design System compliant (more subtle)
  const getRankTextColor = () => {
    if (rank === 1) return 'text-amber-700';
    if (rank === 2) return 'text-slate-600';
    if (rank === 3) return 'text-orange-700';
    return 'text-slate-700';
  };

  // Get rank icon color - Design System compliant (more subtle)
  const getRankIconColor = () => {
    if (rank === 1) return 'text-amber-500';
    if (rank === 2) return 'text-slate-500';
    if (rank === 3) return 'text-orange-500';
    return 'text-slate-500';
  };

  // Get score badge classes - Design System compliant
  const getScoreBadgeClasses = () => {
    if (!score) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const RankIcon = getRankIcon();

  return (
    <div className={`
      inline-flex items-center justify-center 
      px-2.5 py-1.5 md:px-3 md:py-2
      rounded-lg
      border
      text-xs
      font-medium
      transition-colors duration-200
      ${getBadgeClasses()}
      ${className}
    `}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Rank Indicator */}
        {rank && (
          <div className="flex items-center gap-1">
            <RankIcon className={`w-3.5 h-3.5 ${getRankIconColor()}`} strokeWidth={2} />
            <span className={`font-semibold uppercase tracking-wide text-[0.6875rem] ${getRankTextColor()}`}>
              {getRankText()}
            </span>
          </div>
        )}

        {/* Score */}
        {score !== undefined && (
          <div className={`
            inline-flex items-center 
            px-1.5 py-0.5 
            rounded
            border
            font-semibold
            text-[0.6875rem]
            ${getScoreBadgeClasses()}
          `}>
            {score}%
          </div>
        )}

        {/* Distance */}
        {distanceNum !== undefined && !isNaN(distanceNum) && (
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" strokeWidth={2} />
            <span className="font-medium text-[0.6875rem]">
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

  const getRankIcon = () => {
    if (rank === 1) return Trophy;
    if (rank === 2) return Award;
    if (rank === 3) return Medal;
    return BarChart3;
  };

  const getRankIconColor = () => {
    if (rank === 1) return 'text-amber-600';
    if (rank === 2) return 'text-slate-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-blue-600';
  };

  const RankIcon = getRankIcon();

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      px-2 py-1
      rounded-md
      bg-slate-100
      border border-slate-200
      text-[0.6875rem]
      font-semibold
      text-slate-700
      ${className}
    `}>
      {rank && <RankIcon className={`w-3 h-3 ${getRankIconColor()}`} strokeWidth={2} />}
      {score !== undefined && <span className="whitespace-nowrap">{score}%</span>}
      {distanceNum !== undefined && !isNaN(distanceNum) && (
        <span className="flex items-center gap-0.5 whitespace-nowrap">
          <MapPin className="w-3 h-3 text-slate-500" strokeWidth={2} />
          {distanceNum < 1 ? `${(distanceNum * 5280).toFixed(0)}ft` : `${distanceNum.toFixed(1)}mi`}
        </span>
      )}
    </div>
  );
};


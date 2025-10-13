/**
 * StatCard Component
 * Reusable card for displaying statistics with icon, label, value, and trend
 */

import React from 'react';
import { Card } from '../ui';

export interface StatCardProps {
  /** Main value to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Icon/emoji to display */
  icon: string;
  /** Optional trend percentage */
  trend?: {
    value: number;
    label?: string;
  };
  /** Gradient color theme */
  colorScheme?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'primary' | 'accent';
  /** Additional className */
  className?: string;
}

const colorSchemes = {
  yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  primary: 'from-primary-400 to-primary-600 border-primary-500/30',
  accent: 'from-accent-400 to-accent-600 border-accent-500/30',
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  trend,
  colorScheme = 'blue',
  className = '',
}) => {
  return (
    <Card className={`p-4 md:p-6 bg-gradient-to-br ${colorSchemes[colorScheme]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-xs md:text-sm mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center text-xs md:text-sm mt-1">
              <span className={trend.value >= 0 ? 'text-green-300' : 'text-red-300'}>
                {trend.value >= 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-white/60 ml-2">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl md:text-4xl ml-4">{icon}</div>
      </div>
    </Card>
  );
};

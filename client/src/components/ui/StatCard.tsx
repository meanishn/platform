/**
 * StatCard Component
 * Reusable card for displaying statistics with icon, label, value, and trend
 */

import React from 'react';
import { Card } from './Modal';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  /** Main value to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Optional trend percentage */
  trend?: {
    value: number;
    label?: string;
  };
  /** Color theme */
  colorScheme?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'primary' | 'accent';
  /** Additional className */
  className?: string;
}

const colorSchemes = {
  yellow: 'bg-amber-50 border-amber-200',
  green: 'bg-emerald-50 border-emerald-200',
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  red: 'bg-red-50 border-red-200',
  orange: 'bg-orange-50 border-orange-200',
  primary: 'bg-slate-50 border-slate-200',
  accent: 'bg-blue-50 border-blue-200',
};

const iconColorSchemes = {
  yellow: 'bg-amber-100 text-amber-600',
  green: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  primary: 'bg-slate-100 text-slate-600',
  accent: 'bg-blue-100 text-blue-600',
};

const textColorSchemes = {
  yellow: 'text-amber-900',
  green: 'text-emerald-900',
  blue: 'text-blue-900',
  purple: 'text-purple-900',
  red: 'text-red-900',
  orange: 'text-orange-900',
  primary: 'text-slate-900',
  accent: 'text-blue-900',
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon: IconComponent,
  trend,
  colorScheme = 'blue',
  className = '',
}) => {
  return (
    <Card className={`p-4 md:p-6 border ${colorSchemes[colorScheme]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-xs md:text-sm mb-1">{label}</p>
          <p className={`text-2xl md:text-3xl font-bold ${textColorSchemes[colorScheme]}`}>{value}</p>
          {trend && (
            <div className="flex items-center text-xs md:text-sm mt-1">
              <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {trend.value >= 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-slate-500 ml-2">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ml-4 ${iconColorSchemes[colorScheme]}`}>
          <IconComponent className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
};

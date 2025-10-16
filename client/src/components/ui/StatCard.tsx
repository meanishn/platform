/**
 * StatCard Component
 * Unified reusable card for displaying statistics with icon, label, value, and optional trend
 * Supports both clickable and non-clickable variants
 * Fully responsive with mobile-first design
 */

import React from 'react';
import { Card } from './Modal';
import type { LucideIcon } from 'lucide-react';
import { responsiveTypography, responsiveSizes, responsiveSpacing } from '../../styles/responsive.config';

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
  colorScheme?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'primary' | 'accent' | 'amber' | 'emerald' | 'slate';
  /** Optional click handler for clickable stat cards */
  onClick?: () => void;
  /** Whether this card is in active/selected state */
  isActive?: boolean;
  /** Additional className */
  className?: string;
}

const colorSchemes = {
  yellow: 'bg-amber-50 border-amber-200',
  amber: 'bg-amber-50 border-amber-200',
  green: 'bg-emerald-50 border-emerald-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  red: 'bg-red-50 border-red-200',
  orange: 'bg-orange-50 border-orange-200',
  primary: 'bg-slate-50 border-slate-200',
  slate: 'bg-slate-50 border-slate-200',
  accent: 'bg-blue-50 border-blue-200',
};

const iconColorSchemes = {
  yellow: 'bg-amber-100 text-amber-600',
  amber: 'bg-amber-100 text-amber-600',
  green: 'bg-emerald-100 text-emerald-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  primary: 'bg-slate-100 text-slate-600',
  slate: 'bg-slate-100 text-slate-600',
  accent: 'bg-blue-100 text-blue-600',
};

const textColorSchemes = {
  yellow: 'text-amber-900',
  amber: 'text-amber-900',
  green: 'text-emerald-900',
  emerald: 'text-emerald-900',
  blue: 'text-blue-900',
  purple: 'text-purple-900',
  red: 'text-red-900',
  orange: 'text-orange-900',
  primary: 'text-slate-900',
  slate: 'text-slate-900',
  accent: 'text-blue-900',
};

const activeRingSchemes = {
  yellow: 'ring-amber-200',
  amber: 'ring-amber-200',
  green: 'ring-emerald-200',
  emerald: 'ring-emerald-200',
  blue: 'ring-blue-200',
  purple: 'ring-purple-200',
  red: 'ring-red-200',
  orange: 'ring-orange-200',
  primary: 'ring-slate-200',
  slate: 'ring-slate-200',
  accent: 'ring-blue-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon: IconComponent,
  trend,
  colorScheme = 'blue',
  onClick,
  isActive = false,
  className = '',
}) => {
  const content = (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className={`${responsiveTypography.statLabel} mb-0.5 sm:mb-1`}>{label}</p>
        <p className={`${responsiveTypography.statValue} ${textColorSchemes[colorScheme]} truncate`}>
          {value}
        </p>
        {trend && (
          <div className="flex items-center text-[10px] sm:text-xs mt-0.5 sm:mt-1">
            <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {trend.value >= 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-slate-500 ml-1 sm:ml-2 truncate">{trend.label}</span>
            )}
          </div>
        )}
      </div>
      <div className={`${responsiveSizes.iconMedium} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorSchemes[colorScheme]}`}>
        <IconComponent className={`${responsiveSizes.iconSizeMedium}`} strokeWidth={2} />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${responsiveSpacing.cardPadding} border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer text-left w-full ${colorSchemes[colorScheme]} ${
          isActive ? `ring-2 ${activeRingSchemes[colorScheme]} shadow-md` : ''
        } ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Card className={`${responsiveSpacing.cardPadding} border ${colorSchemes[colorScheme]} ${className}`}>
      {content}
    </Card>
  );
};

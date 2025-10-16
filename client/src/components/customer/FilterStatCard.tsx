/**
 * FilterStatCard Component
 * 
 * Extracted from MyRequestsNew to encapsulate clickable filter stat cards.
 * Displays a statistic with icon that acts as a filter button.
 * Follows design system: status-based color schemes with active states.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FilterStatCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  colorScheme: 'blue' | 'amber' | 'emerald' | 'slate';
  isActive: boolean;
  onClick: () => void;
}

const colorSchemeClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    borderActive: 'border-blue-400',
    ring: 'ring-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    countText: 'text-blue-900',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    borderActive: 'border-amber-400',
    ring: 'ring-amber-200',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    countText: 'text-amber-900',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    borderActive: 'border-emerald-400',
    ring: 'ring-emerald-200',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    countText: 'text-emerald-900',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    borderActive: 'border-slate-400',
    ring: 'ring-slate-200',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    countText: 'text-slate-900',
  },
};

export const FilterStatCard: React.FC<FilterStatCardProps> = ({
  label,
  count,
  icon: Icon,
  colorScheme,
  isActive,
  onClick,
}) => {
  const colors = colorSchemeClasses[colorScheme];

  return (
    <button 
      onClick={onClick}
      className={`${colors.bg} border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer text-left ${
        isActive ? `${colors.borderActive} shadow-md ring-2 ${colors.ring}` : colors.border
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-xs md:text-sm mb-1">{label}</p>
          <p className={`text-2xl md:text-3xl font-bold ${colors.countText}`}>{count}</p>
        </div>
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ml-4 flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.iconText}`} strokeWidth={2} />
        </div>
      </div>
    </button>
  );
};


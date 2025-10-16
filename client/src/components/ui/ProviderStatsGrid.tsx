/**
 * ProviderStatsGrid Component
 * 
 * Reusable stats grid for provider information.
 * Displays key metrics in a clean grid layout following design system.
 */

import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
}

export interface ProviderStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ProviderStatsGrid: React.FC<ProviderStatsGridProps> = ({
  stats,
  columns = 2,
  className = '',
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-slate-50 rounded-lg p-3 border border-slate-200"
        >
          <div className="text-xs text-slate-600 mb-1">{stat.label}</div>
          <div className="font-semibold text-slate-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};


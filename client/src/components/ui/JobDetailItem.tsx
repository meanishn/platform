/**
 * JobDetailItem Component
 * Reusable component for displaying a single job detail field (label + value)
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface JobDetailItemProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: string | React.ReactNode;
  /** Optional Lucide icon to show before value */
  icon?: LucideIcon;
  /** Additional className */
  className?: string;
}

export const JobDetailItem: React.FC<JobDetailItemProps> = ({
  label,
  value,
  icon: IconComponent,
  className = '',
}) => {
  return (
    <div className={className}>
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-slate-900 text-sm flex items-center gap-1.5">
        {IconComponent && <IconComponent className="w-4 h-4 text-slate-600" strokeWidth={2} />}
        <span>{value}</span>
      </p>
    </div>
  );
};

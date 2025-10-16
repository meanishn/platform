/**
 * SectionHeaderWithCount Component
 * 
 * Section header with icon, count badge, and optional action.
 * Extracted from Assignments page repeated header pattern.
 * 
 * Usage:
 * <SectionHeaderWithCount 
 *   icon={Hammer}
 *   title="IN PROGRESS"
 *   count={5}
 *   badge="Next: 3"
 * />
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SectionHeaderWithCountProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  count?: number;
  badge?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeaderWithCount: React.FC<SectionHeaderWithCountProps> = ({
  icon: Icon,
  iconColor = 'text-slate-600',
  title,
  count,
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
        <span>{title}{count !== undefined && ` (${count})`}</span>
      </h2>
      {badge && typeof badge === 'string' ? (
        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-200">
          {badge}
        </span>
      ) : badge}
      {action && <div>{action}</div>}
    </div>
  );
};


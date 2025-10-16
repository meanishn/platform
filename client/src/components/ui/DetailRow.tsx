/**
 * DetailRow Component
 * Reusable row for displaying icon + label/value information
 * Extracted from ActiveJobCard, UpcomingJobCard to reduce repetition
 * 
 * Common pattern: <Icon /> <Text or Link>
 */

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface DetailRowProps {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  icon: Icon,
  children,
  className = '',
  iconClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2 text-slate-700 ${className}`}>
      <Icon className={`w-4 h-4 text-slate-600 flex-shrink-0 ${iconClassName}`} strokeWidth={2} />
      {typeof children === 'string' ? <span>{children}</span> : children}
    </div>
  );
};


/**
 * InlineBadge Component
 * 
 * Small inline badge with icon, used for counts and labels.
 * Extracted from Assignments page inline badge pattern.
 * 
 * Usage:
 * <InlineBadge icon={ClipboardList}>Next: 3</InlineBadge>
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InlineBadgeProps {
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const InlineBadge: React.FC<InlineBadgeProps> = ({
  icon: Icon,
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${variantClasses[variant]} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
      <span>{children}</span>
    </span>
  );
};


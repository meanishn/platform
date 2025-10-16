/**
 * DividerWithText Component
 * 
 * Horizontal divider with centered text/icon.
 * Extracted from Assignments page "NEXT UP" separator pattern.
 * 
 * Usage:
 * <DividerWithText icon={ArrowDown}>NEXT UP</DividerWithText>
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DividerWithTextProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DividerWithText: React.FC<DividerWithTextProps> = ({
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-slate-200"></div>
      <span className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
        <span>{children}</span>
      </span>
      <div className="flex-1 h-px bg-slate-200"></div>
    </div>
  );
};


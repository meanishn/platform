/**
 * SectionHeader Component
 * 
 * Consistent section/card header with optional icon and action button.
 * Extracted from repeated pattern in Cards across pages.
 * 
 * Usage:
 * <SectionHeader 
 *   title="Recent Activity" 
 *   icon={TrendingUp}
 *   action={<Button>View All</Button>}
 * />
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconContainer } from './IconContainer';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconVariant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  icon,
  iconVariant = 'info',
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 md:mb-6 ${className}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <IconContainer icon={icon} variant={iconVariant} size="md" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-slate-600 leading-normal mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};


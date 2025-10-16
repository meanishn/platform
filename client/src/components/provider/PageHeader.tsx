/**
 * PageHeader Component
 * Reusable page header with title, description, and optional actions
 */

import React from 'react';
import { Button } from '../ui';
import type { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional Lucide icon before title */
  icon?: LucideIcon;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  /** Additional className */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon: IconComponent,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2 flex items-center gap-2">
          {IconComponent && <IconComponent className="w-7 h-7 text-slate-700" strokeWidth={2} />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-sm md:text-base text-slate-600">{description}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="flex items-center gap-2 self-start md:self-auto"
          disabled={action.disabled}
        >
          {action.icon && <action.icon className="w-4 h-4" strokeWidth={2} />}
          <span>{action.label}</span>
        </Button>
      )}
    </div>
  );
};

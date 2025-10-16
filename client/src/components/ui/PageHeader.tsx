/**
 * PageHeader Component
 * Reusable page header with title, description, and optional actions
 */

import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

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
  const ActionIcon = action?.icon;
  
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-2">
          {IconComponent && <IconComponent className="w-7 h-7 text-slate-600" strokeWidth={2} />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 leading-normal">{description}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="flex items-center gap-2 self-start md:self-auto"
          disabled={action.disabled}
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" strokeWidth={2} />}
          {action.label}
        </Button>
      )}
    </div>
  );
};

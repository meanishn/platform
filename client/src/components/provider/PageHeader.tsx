/**
 * PageHeader Component
 * Reusable page header with title, description, and optional actions
 */

import React from 'react';
import { Button } from '../ui';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional icon/emoji before title */
  icon?: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
    disabled?: boolean;
  };
  /** Additional className */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-white/70">{description}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="flex items-center gap-2 self-start md:self-auto"
          disabled={action.disabled}
        >
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
};

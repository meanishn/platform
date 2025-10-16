/**
 * EmptyState Component
 * Reusable empty state display with icon, message, and optional action
 */

import React from 'react';
import { Card } from './Modal';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  /** Additional className for Card */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <Card className={`p-8 md:p-12 text-center bg-white border-slate-200 ${className}`}>
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconComponent className="w-10 h-10 text-slate-400" strokeWidth={2} />
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-slate-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
};

/**
 * EmptyState Component
 * Reusable empty state display with icon, message, and optional action
 */

import React from 'react';
import { Card } from './Modal';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Icon/emoji to display */
  icon: string;
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
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <Card className={`p-8 md:p-12 text-center ${className}`}>
      <div className="text-5xl md:text-6xl mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-white/70 mb-6 max-w-md mx-auto">
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

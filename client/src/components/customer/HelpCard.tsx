/**
 * HelpCard Component
 * 
 * Extracted from Customer Dashboard to encapsulate help/support card.
 * Displays helpful information and action buttons for customer support.
 */

import React from 'react';
import { Card, Button } from '../ui';

export interface HelpCardProps {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction: {
    label: string;
    onClick: () => void;
  };
}

export const HelpCard: React.FC<HelpCardProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Card>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            {description}
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        </div>
      </div>
    </Card>
  );
};


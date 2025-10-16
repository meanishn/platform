/**
 * HelpCard Component
 * 
 * Extracted from Customer Dashboard to encapsulate help/support card.
 * Displays helpful information and action buttons for customer support.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { Card, Button } from '../ui';
import { responsiveSpacing, responsiveTypography } from '../../styles/responsive.config';

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
      <div className={responsiveSpacing.cardPadding}>
        <h3 className={`${responsiveTypography.subsectionHeading} mb-3 sm:mb-4`}>
          {title}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <p className={`${responsiveTypography.bodyPrimary}`}>
            {description}
          </p>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full text-xs sm:text-sm"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        </div>
      </div>
    </Card>
  );
};


/**
 * PageHeaderActions Component
 * 
 * Reusable header with title, description, and action buttons.
 * Extracted from various pages to follow refactor guidelines.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { responsiveTypography, commonPatterns } from '../../styles/responsive.config';

export interface PageHeaderActionsProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeaderActions: React.FC<PageHeaderActionsProps> = ({
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`${commonPatterns.flexBetween} ${className}`}>
      <div className="flex-1 min-w-0">
        <h1 className={responsiveTypography.pageTitle}>
          {title}
        </h1>
        {description && (
          <p className={`${responsiveTypography.bodyPrimary} mt-1`}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className={`${commonPatterns.buttonGroup} flex-shrink-0`}>
          {actions}
        </div>
      )}
    </div>
  );
};


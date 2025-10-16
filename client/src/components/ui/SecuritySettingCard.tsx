/**
 * SecuritySettingCard Component
 * 
 * Displays a security setting with title, description, and action button.
 * Extracted from Profile.tsx following design system.
 */

import React from 'react';
import { Button } from './Button';

export interface SecuritySettingCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const SecuritySettingCard: React.FC<SecuritySettingCardProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <Button variant="outline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
};


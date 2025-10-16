/**
 * SubsectionLabel Component
 * 
 * Small uppercase label for subsections within cards.
 * Extracted from repeated pattern in Provider Dashboard.
 * 
 * Usage:
 * <SubsectionLabel>Provider Actions</SubsectionLabel>
 */

import React from 'react';

export interface SubsectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const SubsectionLabel: React.FC<SubsectionLabelProps> = ({
  children,
  className = '',
}) => {
  return (
    <h4 className={`text-xs text-slate-500 font-medium uppercase tracking-wide mb-2 ${className}`}>
      {children}
    </h4>
  );
};


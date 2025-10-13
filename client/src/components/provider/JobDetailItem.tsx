/**
 * JobDetailItem Component
 * Reusable component for displaying a single job detail field (label + value)
 */

import React from 'react';

export interface JobDetailItemProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: string | React.ReactNode;
  /** Optional icon/emoji to show before value */
  icon?: string;
  /** Additional className */
  className?: string;
}

export const JobDetailItem: React.FC<JobDetailItemProps> = ({
  label,
  value,
  icon,
  className = '',
}) => {
  return (
    <div className={className}>
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-white text-sm flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {value}
      </p>
    </div>
  );
};

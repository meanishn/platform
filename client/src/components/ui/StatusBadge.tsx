/**
 * StatusBadge Component
 * Reusable badge for displaying job status
 */

import React from 'react';
import { Badge } from './Modal';

export interface StatusBadgeProps {
  /** Status value */
  status: 'pending' | 'accepted' | 'eligible' | 'notified' | 'selected' | 'completed' | 'cancelled' | string;
  /** Additional className */
  className?: string;
}

const statusConfigs: Record<string, { variant: 'warning' | 'success' | 'danger' | 'info' | 'default' | 'primary', label: string, icon: string }> = {
  pending: { variant: 'warning', label: 'Pending Review', icon: '⏳' },
  accepted: { variant: 'success', label: 'Accepted', icon: '✅' },
  eligible: { variant: 'info', label: 'Eligible', icon: '🎯' },
  notified: { variant: 'warning', label: 'New', icon: '🔔' },
  selected: { variant: 'success', label: 'Selected', icon: '⭐' },
  completed: { variant: 'default', label: 'Completed', icon: '✓' },
  cancelled: { variant: 'danger', label: 'Cancelled', icon: '❌' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfigs[status.toLowerCase()] || { 
    variant: 'default' as const, 
    label: status, 
    icon: '📋' 
  };
  
  return (
    <Badge variant={config.variant} className={`text-xs ${className}`}>
      {config.icon} {config.label}
    </Badge>
  );
};

/**
 * UrgencyBadge Component
 * Reusable badge for displaying job urgency levels
 */

import React from 'react';
import { Badge } from './Modal';

export interface UrgencyBadgeProps {
  /** Urgency level */
  urgency: 'emergency' | 'high' | 'medium' | 'low' | string;
  /** Additional className */
  className?: string;
}

const urgencyConfigs: Record<string, { variant: 'danger' | 'warning' | 'primary' | 'default', icon: string }> = {
  emergency: { variant: 'danger', icon: '🚨' },
  high: { variant: 'warning', icon: '⚡' },
  medium: { variant: 'primary', icon: '📋' },
  low: { variant: 'default', icon: '📌' }
};

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  className = '',
}) => {
  const config = urgencyConfigs[urgency.toLowerCase()] || urgencyConfigs.low;
  
  return (
    <Badge variant={config.variant} className={`text-xs ${className}`}>
      {config.icon} {urgency.toUpperCase()}
    </Badge>
  );
};

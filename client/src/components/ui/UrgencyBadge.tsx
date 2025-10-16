/**
 * UrgencyBadge Component
 * Reusable badge for displaying job urgency levels
 */

import React from 'react';
import { Badge } from './Modal';
import { AlertCircle, Zap, ClipboardList, Pin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface UrgencyBadgeProps {
  /** Urgency level */
  urgency: 'emergency' | 'high' | 'medium' | 'low' | string;
  /** Additional className */
  className?: string;
}

const urgencyConfigs: Record<string, { variant: 'danger' | 'warning' | 'primary' | 'default', icon: LucideIcon }> = {
  emergency: { variant: 'danger', icon: AlertCircle },
  high: { variant: 'warning', icon: Zap },
  medium: { variant: 'primary', icon: ClipboardList },
  low: { variant: 'default', icon: Pin }
};

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  className = '',
}) => {
  const config = urgencyConfigs[urgency.toLowerCase()] || urgencyConfigs.low;
  const IconComponent = config.icon;
  
  return (
    <Badge variant={config.variant} className={`flex items-center gap-1.5 text-xs ${className}`}>
      <IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{urgency.toUpperCase()}</span>
    </Badge>
  );
};

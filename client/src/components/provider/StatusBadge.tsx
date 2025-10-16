/**
 * StatusBadge Component
 * Reusable badge for displaying job status
 */

import React from 'react';
import { Badge } from '../ui';
import { Clock, CheckCircle2, Target, Bell, Star, Check, X, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatusBadgeProps {
  /** Status value */
  status: 'pending' | 'accepted' | 'eligible' | 'notified' | 'selected' | 'completed' | 'cancelled' | string;
  /** Additional className */
  className?: string;
}

const statusConfigs: Record<string, { variant: 'warning' | 'success' | 'danger' | 'info' | 'default' | 'primary', label: string, icon: LucideIcon }> = {
  pending: { variant: 'warning', label: 'Pending Review', icon: Clock },
  accepted: { variant: 'success', label: 'Accepted', icon: CheckCircle2 },
  eligible: { variant: 'info', label: 'Eligible', icon: Target },
  notified: { variant: 'warning', label: 'New', icon: Bell },
  selected: { variant: 'success', label: 'Selected', icon: Star },
  completed: { variant: 'default', label: 'Completed', icon: Check },
  cancelled: { variant: 'danger', label: 'Cancelled', icon: X }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfigs[status.toLowerCase()] || { 
    variant: 'default' as const, 
    label: status, 
    icon: FileText
  };
  
  const IconComponent = config.icon;
  
  return (
    <Badge variant={config.variant} className={`flex items-center gap-1.5 text-xs ${className}`}>
      <IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{config.label}</span>
    </Badge>
  );
};

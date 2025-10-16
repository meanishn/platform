/**
 * Badge Helper Utilities
 * 
 * Extracted from MyRequestsNew to centralize status and urgency badge logic.
 * These utilities provide consistent badge rendering across the application.
 */

import React from 'react';
import { Badge } from '../components/ui';
import { 
  Clock, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  Hammer, 
  AlertCircle 
} from 'lucide-react';

/**
 * Get status badge component for service request status
 */
export const getStatusBadge = (status: string) => {
  const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info', label: string, IconComponent: typeof Clock }> = {
    pending: { variant: 'warning', label: 'Awaiting Providers', IconComponent: Clock },
    assigned: { variant: 'info', label: 'Provider Assigned', IconComponent: CheckCircle },
    in_progress: { variant: 'primary', label: 'In Progress', IconComponent: Hammer },
    completed: { variant: 'success', label: 'Completed', IconComponent: CheckCircle2 },
    cancelled: { variant: 'danger', label: 'Cancelled', IconComponent: XCircle },
  };
  
  const config = configs[status] || { variant: 'default' as const, label: status, IconComponent: AlertCircle };
  
  return (
    <Badge variant={config.variant} size="sm">
      <span className="inline-flex items-center gap-1.5">
        <config.IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{config.label}</span>
      </span>
    </Badge>
  );
};

/**
 * Get urgency badge component for service request urgency level
 */
export const getUrgencyBadge = (urgency: string) => {
  const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', IconComponent: typeof AlertCircle }> = {
    emergency: { variant: 'danger', IconComponent: AlertCircle },
    high: { variant: 'danger', IconComponent: AlertCircle },
    medium: { variant: 'warning', IconComponent: AlertCircle },
    low: { variant: 'success', IconComponent: CheckCircle },
  };
  
  const config = configs[urgency] || { variant: 'default' as const, IconComponent: AlertCircle };
  
  return (
    <Badge variant={config.variant} size="sm">
      <span className="inline-flex items-center gap-1.5">
        <config.IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="capitalize">{urgency}</span>
      </span>
    </Badge>
  );
};

/**
 * Get status-based card background classes
 */
export const getCardBackground = (
  status: string, 
  urgency?: string
): string => {
  const isCompleted = status === 'completed';
  const isActive = status === 'in_progress' || status === 'assigned';
  const isPending = status === 'pending';
  
  if (isCompleted) return 'bg-emerald-50/30 border-emerald-200/50';
  if (isActive) return 'bg-amber-50/30 border-amber-200/50';
  if (isPending && urgency === 'high') return 'bg-red-50/30 border-red-200/50';
  if (isPending) return 'bg-blue-50/30 border-blue-200/50';
  return 'bg-slate-50/30 border-slate-200';
};

/**
 * Get status-based left accent border classes
 */
export const getAccentBorder = (
  status: string, 
  urgency?: string
): string => {
  const isCompleted = status === 'completed';
  const isActive = status === 'in_progress' || status === 'assigned';
  const isPending = status === 'pending';
  
  if (isCompleted) return 'border-l-4 border-l-emerald-300';
  if (isActive) return 'border-l-4 border-l-amber-300';
  if (isPending && urgency === 'high') return 'border-l-4 border-l-red-300';
  if (isPending) return 'border-l-4 border-l-blue-300';
  return 'border-l-4 border-l-slate-300';
};


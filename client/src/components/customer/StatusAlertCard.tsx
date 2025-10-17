/**
 * StatusAlertCard Component
 * 
 * Displays status-specific alert cards for service requests.
 * Handles different statuses: pending with providers, assigned, in_progress, completed.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Card, Button } from '../ui';
import { Users, Hammer, Check, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatusAlertCardProps {
  type: 'accepted_providers' | 'assigned' | 'in_progress' | 'completed';
  providerCount?: number;
  onViewProviders?: () => void;
  className?: string;
}

interface StatusConfig {
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  accepted_providers: {
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-600',
    iconBgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: Users,
    title: '', // Dynamic based on count
    description: 'Review their profiles and choose the best match for your needs.',
  },
  assigned: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Check,
    title: 'Provider Confirmed',
    description: 'A provider has been assigned and will start soon',
  },
  in_progress: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: Hammer,
    title: 'Work in Progress',
    description: 'Your service provider is currently working on this request',
  },
  completed: {
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: CheckCircle2,
    title: 'Work Completed!',
    description: 'Please review your service provider\'s work',
  },
};

export const StatusAlertCard: React.FC<StatusAlertCardProps> = ({
  type,
  providerCount = 0,
  onViewProviders,
  className = '',
}) => {
  const config = statusConfigs[type];
  const Icon = config.icon;

  // Dynamic title for accepted_providers
  const title = type === 'accepted_providers'
    ? (providerCount === 1 ? '1 provider has accepted!' : `${providerCount} providers have accepted!`)
    : config.title;

  return (
    <Card className={className}>
      <div className="p-4 sm:p-5 md:p-6">
        <div className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-3 sm:p-4`}>
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${config.iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0 ${type === 'accepted_providers' ? `border ${config.borderColor.replace('border-', 'border-')}` : ''}`}>
              <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${config.iconColor}`} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-slate-900 mb-1">{title}</p>
              <p className="text-xs sm:text-sm text-slate-600 mb-2.5 sm:mb-3 leading-relaxed">{config.description}</p>
              {type === 'accepted_providers' && onViewProviders && (
                <Button
                  size="sm"
                  onClick={onViewProviders}
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white font-medium"
                >
                  View & Select Provider
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};


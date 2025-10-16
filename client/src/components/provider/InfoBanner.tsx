/**
 * InfoBanner Component
 * Reusable informational banner with icon and message
 */

import React from 'react';
import { Card } from '../ui';
import type { LucideIcon } from 'lucide-react';

export interface InfoBannerProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Banner title */
  title?: string;
  /** Banner message */
  message: string | React.ReactNode;
  /** Color variant */
  variant?: 'info' | 'warning' | 'success' | 'danger';
  /** Additional className */
  className?: string;
}

const variantStyles = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-amber-50 border-amber-200',
  success: 'bg-emerald-50 border-emerald-200',
  danger: 'bg-red-50 border-red-200',
};

const iconStyles = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  danger: 'bg-red-100 text-red-600',
};

const textStyles = {
  info: 'text-blue-900',
  warning: 'text-amber-900',
  success: 'text-emerald-900',
  danger: 'text-red-900',
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  icon: IconComponent,
  title,
  message,
  variant = 'info',
  className = '',
}) => {
  return (
    <Card className={`border ${variantStyles[variant]} p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyles[variant]}`}>
          <IconComponent className="w-5 h-5" strokeWidth={2} />
        </div>
        <div className="flex-1">
          {title && (
            <p className={`font-semibold mb-1 ${textStyles[variant]}`}>{title}</p>
          )}
          <div className={`text-sm ${textStyles[variant]}`}>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
      </div>
    </Card>
  );
};

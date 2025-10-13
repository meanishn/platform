/**
 * InfoBanner Component
 * Reusable informational banner with icon and message
 */

import React from 'react';
import { Card } from './Modal';

export interface InfoBannerProps {
  /** Icon/emoji to display */
  icon: string;
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
  info: 'bg-blue-500/20 border-blue-400/30',
  warning: 'bg-yellow-500/20 border-yellow-400/30',
  success: 'bg-green-500/20 border-green-400/30',
  danger: 'bg-red-500/20 border-red-400/30',
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  icon,
  title,
  message,
  variant = 'info',
  className = '',
}) => {
  return (
    <Card className={`${variantStyles[variant]} p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          {title && (
            <p className="text-white font-medium mb-1">{title}</p>
          )}
          <div className="text-white/80 text-sm">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
      </div>
    </Card>
  );
};

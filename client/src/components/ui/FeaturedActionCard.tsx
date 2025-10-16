// client/src/components/ui/FeaturedActionCard.tsx
// Prominent hero-style card for highlighting primary user actions
// Extracted to provide a consistent, eye-catching CTA section on dashboards
// Fully responsive with mobile-first design

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { responsiveSpacing } from '../../styles/responsive.config';

export interface FeaturedActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'primary' | 'success' | 'info';
  className?: string;
}

export const FeaturedActionCard: React.FC<FeaturedActionCardProps> = ({
  icon: IconComponent,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'primary',
  className = '',
}) => {
  const variantClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-slate-900',
      descColor: 'text-slate-600',
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-slate-900',
      descColor: 'text-slate-600',
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-slate-900',
      descColor: 'text-slate-600',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg ${responsiveSpacing.cardPaddingY} px-4 sm:px-6 md:px-8 shadow-md hover:shadow-xl transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
        {/* Icon */}
        <div className={`${styles.iconBg} ${styles.iconColor} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm`}>
          <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2} />
        </div>

        {/* Text Content */}
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${styles.titleColor} leading-tight`}>
            {title}
          </h2>
          <p className={`text-sm sm:text-base md:text-lg ${styles.descColor} leading-relaxed`}>
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={primaryAction.onClick}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


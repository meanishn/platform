/**
 * IconContainer Component
 * 
 * Consistent icon container with background and colors from design system.
 * Extracted from repeated pattern in Dashboard, Cards, and Alerts.
 * 
 * Usage:
 * <IconContainer variant="success" size="md">
 *   <CheckCircle className="w-5 h-5" />
 * </IconContainer>
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconContainerProps {
  children?: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: 'lg' | 'xl' | 'full';
}

export const IconContainer: React.FC<IconContainerProps> = ({
  children,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className = '',
  rounded = 'xl',
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
    error: 'bg-red-100 text-red-600',
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-11 h-11',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  const roundedClasses = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${roundedClasses[rounded]} flex items-center justify-center ${className}`}
    >
      {Icon ? (
        <Icon className={iconSizeClasses[size]} strokeWidth={2} />
      ) : (
        children
      )}
    </div>
  );
};


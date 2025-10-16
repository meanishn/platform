import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconProps {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Additional CSS classes */
  className?: string;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
}

/**
 * Icon Component
 * Wrapper around Lucide React icons for consistent sizing and coloring
 * 
 * @example
 * <Icon icon={CheckCircle2} variant="success" size="md" />
 * <Icon icon={AlertCircle} variant="warning" />
 */
export const Icon: React.FC<IconProps> = ({
  icon: LucideIconComponent,
  size = 'md',
  variant = 'default',
  className = '',
  strokeWidth = 2,
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',  // 14px
    sm: 'w-4 h-4',      // 16px
    md: 'w-5 h-5',      // 20px - DEFAULT
    lg: 'w-6 h-6',      // 24px
    xl: 'w-8 h-8',      // 32px
  };

  const variantClasses = {
    default: 'text-gray-500',
    muted: 'text-gray-400',
    primary: 'text-blue-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-indigo-500',
  };

  return (
    <LucideIconComponent
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
};

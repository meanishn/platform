/**
 * InfoAlert Component
 * 
 * Inline alert/info box with icon and message.
 * Extracted from Assignments page repeated info box pattern.
 * 
 * Usage:
 * <InfoAlert icon={Lightbulb} variant="info">
 *   Your next job starts at 2:00 PM
 * </InfoAlert>
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InfoAlertProps {
  icon?: LucideIcon;
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({
  icon: Icon,
  variant = 'info',
  children,
  action,
  className = '',
}) => {
  const variantClasses = {
    info: 'bg-slate-50 border-slate-200 text-slate-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  const iconColorClasses = {
    info: 'text-slate-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <div className={`p-4 rounded-lg border ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start gap-2">
        {Icon && (
          <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColorClasses[variant]}`} strokeWidth={2} />
        )}
        <div className="flex-1">
          <div className="text-sm">{children}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
};


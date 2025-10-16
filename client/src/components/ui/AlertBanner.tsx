/**
 * AlertBanner Component
 * 
 * Alert banner for displaying error, warning, success, or info messages.
 * Extracted from auth forms following design system.
 */

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react';

export interface AlertBannerProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: LucideIcon;
}

const variantConfig = {
  error: {
    containerBg: 'bg-red-100',
    borderColor: 'border-red-300',
    iconBg: 'bg-red-200',
    iconColor: 'text-red-700',
    defaultIcon: AlertCircle,
  },
  success: {
    containerBg: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    iconBg: 'bg-emerald-200',
    iconColor: 'text-emerald-700',
    defaultIcon: CheckCircle,
  },
  warning: {
    containerBg: 'bg-amber-100',
    borderColor: 'border-amber-300',
    iconBg: 'bg-amber-200',
    iconColor: 'text-amber-700',
    defaultIcon: AlertTriangle,
  },
  info: {
    containerBg: 'bg-blue-100',
    borderColor: 'border-blue-300',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-700',
    defaultIcon: Info,
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'error',
  title,
  message,
  icon: CustomIcon,
}) => {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.defaultIcon;

  return (
    <div className={`mb-6 p-4 ${config.containerBg} border ${config.borderColor} rounded-lg`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">{title}</p>
          <p className="text-sm text-slate-700">{message}</p>
        </div>
      </div>
    </div>
  );
};


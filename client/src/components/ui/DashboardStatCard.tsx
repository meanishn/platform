import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardStatCardProps {
  icon: LucideIcon | string;
  label: string;
  value: string | number;
  colorScheme?: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'red';
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  icon,
  label,
  value,
  colorScheme = 'blue'
}) => {
  // Design System: Clean stat cards with solid backgrounds, no gradients
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    yellow: 'bg-amber-50 border-amber-200',
    purple: 'bg-slate-50 border-slate-200',
    indigo: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200'
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-emerald-100',
    yellow: 'bg-amber-100',
    purple: 'bg-slate-100',
    indigo: 'bg-blue-100',
    red: 'bg-red-100'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    purple: 'text-slate-600',
    indigo: 'text-blue-600',
    red: 'text-red-600'
  };

  const labelColorClasses = {
    blue: 'text-slate-600',
    green: 'text-slate-600',
    yellow: 'text-slate-600',
    purple: 'text-slate-600',
    indigo: 'text-slate-600',
    red: 'text-slate-600'
  };

  const valueColorClasses = {
    blue: 'text-blue-900',
    green: 'text-emerald-900',
    yellow: 'text-amber-900',
    purple: 'text-slate-900',
    indigo: 'text-blue-900',
    red: 'text-red-900'
  };

  const bgClass = colorClasses[colorScheme];
  const iconBgClass = iconBgClasses[colorScheme];
  const iconColorClass = iconColorClasses[colorScheme];
  const labelColorClass = labelColorClasses[colorScheme];
  const valueColorClass = valueColorClasses[colorScheme];

  const IconComponent = typeof icon === 'string' ? null : icon;

  return (
    <div className={`${bgClass} border rounded-lg p-4 md:p-6 transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${labelColorClass} text-xs md:text-sm mb-1`}>
            {label}
          </p>
          <p className={`text-2xl md:text-3xl font-bold ${valueColorClass}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgClass} rounded-xl flex items-center justify-center ml-4 flex-shrink-0`}>
          {IconComponent ? (
            <IconComponent className={`w-6 h-6 ${iconColorClass}`} strokeWidth={2} />
          ) : typeof icon === 'string' ? (
            <span className="text-2xl">{icon}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

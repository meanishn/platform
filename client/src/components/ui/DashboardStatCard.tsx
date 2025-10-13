import React from 'react';

export interface DashboardStatCardProps {
  icon: string;
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
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-400/20',
    green: 'from-green-500/10 to-green-500/5 border-green-400/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-400/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-400/20',
    indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-400/20',
    red: 'from-red-500/10 to-red-500/5 border-red-400/20'
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    red: 'text-red-600'
  };

  const bgClass = colorClasses[colorScheme];
  const textClass = textColorClasses[colorScheme];

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${bgClass} border backdrop-blur-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-default`}>
      <div className="p-3">
        <div className="flex flex-col items-center text-center gap-1.5">
          <span className="text-2xl opacity-80">{icon}</span>
          <div className="w-full">
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-wide mb-0.5">
              {label}
            </p>
            <p className={`text-lg font-bold ${textClass} break-words leading-tight`}>
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

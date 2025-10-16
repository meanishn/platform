/**
 * AdminStatCard Component
 * 
 * Extracted from Admin Dashboard to encapsulate stat card presentation.
 * Displays a single statistic with an icon and value.
 * Follows design system: minimal, clean card with icon container.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui';

export interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: string; // emoji
  colorScheme: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'red' | 'teal';
}

const colorSchemeClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-600',
  },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  label,
  value,
  icon,
  colorScheme,
}) => {
  const colors = colorSchemeClasses[colorScheme];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <span className={`${colors.text} text-sm font-medium`}>{icon}</span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};


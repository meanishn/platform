/**
 * UrgencySelector Component
 * 
 * Reusable urgency level selector for service requests.
 * Displays urgency options with icons and descriptions.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Calendar, Clock, Flame, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface UrgencyOption {
  value: UrgencyLevel;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (urgency: UrgencyLevel) => void;
  className?: string;
}

// Urgency configuration following design system
export const urgencyOptions: UrgencyOption[] = [
  { 
    value: 'low',
    label: 'Low Priority', 
    icon: Calendar, 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    description: 'Can wait a few days'
  },
  { 
    value: 'medium',
    label: 'Medium Priority', 
    icon: Clock, 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-200',
    description: 'Within 1-2 days'
  },
  { 
    value: 'high',
    label: 'High Priority', 
    icon: Flame, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    description: 'Same day preferred'
  },
  { 
    value: 'emergency',
    label: 'Emergency', 
    icon: AlertTriangle, 
    color: 'text-red-700', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-300',
    description: 'Immediate attention required'
  }
];

export const UrgencySelector: React.FC<UrgencySelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {urgencyOptions.map((option) => {
        const isSelected = value === option.value;
        const IconComponent = option.icon;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              p-4 rounded-xl border-2 transition-all text-center
              hover:shadow-md
              ${isSelected 
                ? `${option.borderColor} ${option.bgColor} shadow-md` 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            <div className="flex justify-center mb-2">
              <IconComponent className={`w-8 h-8 ${isSelected ? option.color : 'text-slate-400'}`} />
            </div>
            <div className={`font-semibold text-sm mb-1 ${isSelected ? option.color : 'text-slate-700'}`}>
              {option.label}
            </div>
            <div className="text-xs text-slate-500">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
};


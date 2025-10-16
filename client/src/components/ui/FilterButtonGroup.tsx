/**
 * FilterButtonGroup Component
 * 
 * Reusable filter button group following design system.
 * Displays a row of filter buttons with icons and active state.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface FilterButtonGroupProps {
  options: FilterOption[];
  activeFilter: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FilterButtonGroup: React.FC<FilterButtonGroupProps> = ({
  options,
  activeFilter,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = activeFilter === option.value;
        
        return (
          <Button
            key={option.value}
            variant={isActive ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap flex items-center gap-2 font-medium ${
              isActive ? 'shadow-md' : ''
            }`}
          >
            {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
            <span>
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </span>
          </Button>
        );
      })}
    </div>
  );
};


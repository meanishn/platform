/**
 * FilterButtonGroup Component
 * 
 * Reusable filter button group following design system.
 * Displays a row of filter buttons with icons and active state.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { responsiveSizes, commonPatterns } from '../../styles/responsive.config';

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
    <div className={`${commonPatterns.buttonGroup} ${className}`}>
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = activeFilter === option.value;
        
        return (
          <Button
            key={option.value}
            variant={isActive ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap flex items-center gap-1.5 sm:gap-2 font-medium px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm ${
              isActive ? 'shadow-md' : ''
            }`}
          >
            {Icon && <Icon className={`${responsiveSizes.iconSizeSmall} flex-shrink-0`} strokeWidth={2} />}
            <span className="truncate">
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </span>
          </Button>
        );
      })}
    </div>
  );
};


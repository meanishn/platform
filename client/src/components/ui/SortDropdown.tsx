/**
 * SortDropdown Component
 * 
 * Reusable sort dropdown following design system.
 * Displays a labeled dropdown for sorting options.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { responsiveTypography } from '../../styles/responsive.config';

export interface SortOption {
  value: string;
  label: string;
}

export interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  onChange,
  label = 'Sort by:',
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto ${className}`}>
      <label 
        htmlFor="sort-dropdown"
        className={`${responsiveTypography.bodyPrimary} font-medium whitespace-nowrap`}
      >
        {label}
      </label>
      <select
        id="sort-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 transition-colors cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};


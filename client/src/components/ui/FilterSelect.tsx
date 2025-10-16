/**
 * FilterSelect Component
 * 
 * Reusable select dropdown for filtering with consistent styling.
 * Matches SearchBar and SortDropdown styling following design system.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { Select } from './Form';

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}) => {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-9 sm:h-10 text-xs sm:text-sm border-slate-300 focus:border-slate-400 ${className}`}
    >
      {placeholder && <option value="all">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};


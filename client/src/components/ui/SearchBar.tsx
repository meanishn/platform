/**
 * SearchBar Component
 * 
 * Reusable search input with icon following design system.
 * Encapsulates the common pattern of search input with left-positioned icon.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './Form';
import { responsiveSizes } from '../../styles/responsive.config';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search 
        className={`${responsiveSizes.iconSizeSmall} text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none`}
        strokeWidth={2} 
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 sm:pl-9 pr-3 text-xs sm:text-sm h-9 sm:h-10 border-slate-300 focus:border-slate-400 placeholder:text-slate-400"
        aria-label={placeholder || 'Search'}
      />
    </div>
  );
};


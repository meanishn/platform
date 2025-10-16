/**
 * SearchBar Component
 * 
 * Reusable search input with icon following design system.
 * Encapsulates the common pattern of search input with left-positioned icon.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './Form';

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
        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" 
        strokeWidth={2} 
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 text-sm h-10 border-slate-300 focus:border-slate-400"
      />
    </div>
  );
};


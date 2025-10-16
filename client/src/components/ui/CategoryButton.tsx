/**
 * CategoryButton Component
 * 
 * Reusable button for service category selection.
 * Displays icon, category name, and service count.
 * Follows design system for consistent styling.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryButtonProps {
  name: string;
  icon: LucideIcon;
  count: number;
  onClick: () => void;
  className?: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({
  name,
  icon: IconComponent,
  count,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
    >
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
        <IconComponent className="w-5 h-5 text-slate-600" strokeWidth={2} />
      </div>
      <div className="font-medium text-slate-900 text-sm">{name}</div>
      <div className="text-xs text-slate-600">{count} services</div>
    </button>
  );
};


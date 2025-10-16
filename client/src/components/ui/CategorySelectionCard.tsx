/**
 * CategorySelectionCard Component
 * 
 * Reusable card for selecting a service category.
 * Displays icon, name, description with active state.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ServiceCategoryDto } from '../../types/api';

export interface CategorySelectionCardProps {
  category: ServiceCategoryDto;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

export const CategorySelectionCard: React.FC<CategorySelectionCardProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id.toString())}
      className={`
        relative p-6 rounded-xl border-2 transition-all text-left
        hover:shadow-lg
        ${isSelected 
          ? 'border-slate-700 bg-slate-50 shadow-md' 
          : 'border-slate-200 bg-white hover:border-slate-400'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className="text-4xl mb-3">{category.icon || '🔧'}</div>
      <h4 className="font-semibold text-lg text-slate-900 mb-1">{category.name}</h4>
      {category.description && (
        <p className="text-sm text-slate-600 line-clamp-2">{category.description}</p>
      )}
    </button>
  );
};


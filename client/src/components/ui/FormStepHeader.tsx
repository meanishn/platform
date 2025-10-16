/**
 * FormStepHeader Component
 * 
 * Reusable numbered step header for multi-step forms.
 * Follows design system for consistent styling.
 */

import React from 'react';

export interface FormStepHeaderProps {
  stepNumber: number;
  title: string;
  className?: string;
}

export const FormStepHeader: React.FC<FormStepHeaderProps> = ({
  stepNumber,
  title,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-full font-bold text-sm flex-shrink-0">
        {stepNumber}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    </div>
  );
};


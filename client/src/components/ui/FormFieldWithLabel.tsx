/**
 * FormFieldWithLabel Component
 * 
 * Reusable form field wrapper with consistent label styling.
 * Supports required field indicator and help text.
 * Follows design system for consistent styling.
 */

import React from 'react';

export interface FormFieldWithLabelProps {
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const FormFieldWithLabel: React.FC<FormFieldWithLabelProps> = ({
  label,
  required = false,
  helpText,
  children,
  htmlFor,
  className = '',
}) => {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="text-xs text-slate-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};


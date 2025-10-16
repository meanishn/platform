/**
 * FormLabel Component
 * 
 * Consistent form label styling from design system.
 * Extracted pattern for reusable label component.
 * 
 * Usage:
 * <FormLabel htmlFor="email" required>Email Address</FormLabel>
 */

import React from 'react';

export interface FormLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required = false,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-slate-700 mb-2 ${className}`}
    >
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  );
};


/**
 * Textarea Component
 * 
 * Multi-line text input with consistent styling from design system.
 * Follows the same pattern as Input component.
 */

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500
          placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500
          ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';


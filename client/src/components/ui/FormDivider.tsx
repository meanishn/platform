/**
 * FormDivider Component
 * 
 * Horizontal divider with centered text label.
 * Commonly used in auth forms to separate sections.
 */

import React from 'react';

export interface FormDividerProps {
  text?: string;
}

export const FormDivider: React.FC<FormDividerProps> = ({
  text = 'Or continue with',
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-slate-500 text-xs font-medium uppercase tracking-wide">
          {text}
        </span>
      </div>
    </div>
  );
};


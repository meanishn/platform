/**
 * Checkbox Component
 * 
 * A reusable checkbox input following the design system guidelines.
 * Features muted colors, subtle focus states, and smooth transitions.
 * 
 * Design System Compliance:
 * - Muted slate-600 checked color (professional, not harsh)
 * - Subtle focus ring with 20% opacity (no harsh outline)
 * - 2px border for better visibility in unchecked state
 * - Smooth transitions for all states
 */

import React from 'react';

export interface CheckboxProps {
  /**
   * Whether the checkbox is checked
   */
  checked: boolean;
  
  /**
   * Callback when checkbox state changes
   */
  onChange: (checked: boolean) => void;
  
  /**
   * Accessible label for screen readers
   */
  label?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * ID for the checkbox input
   */
  id?: string;
  
  /**
   * Size variant
   */
  size?: 'standard' | 'large';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
  id,
  size = 'standard',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const sizeClasses = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      aria-label={label}
      className={`
        ${sizeClasses}
        rounded 
        border-2 
        border-slate-300 
        bg-white
        text-slate-600
        transition-all 
        duration-200
        focus:outline-none 
        focus:ring-2 
        focus:ring-slate-500/20
        focus:ring-offset-2
        hover:border-slate-400
        checked:bg-slate-600
        checked:border-slate-600
        disabled:opacity-50 
        disabled:cursor-not-allowed
        cursor-pointer
        flex-shrink-0
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    />
  );
};


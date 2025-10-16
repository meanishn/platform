/**
 * ToggleSwitch Component
 * 
 * iOS-style toggle switch for boolean preferences.
 * Extracted from Profile.tsx following design system.
 */

import React from 'react';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-slate-900">{label}</h4>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 
          rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
          after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
          peer-checked:bg-slate-700 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );
};


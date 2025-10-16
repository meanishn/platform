/**
 * RoleSelector Component
 * 
 * Radio button selector for user role (customer/provider) in registration form.
 * Extracted from RegisterForm following design system.
 */

import React from 'react';

export interface RoleSelectorProps {
  value: 'customer' | 'provider';
  onChange: (role: 'customer' | 'provider') => void;
  name?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  name = 'role',
}) => {
  return (
    <div>
      <label className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
        Account Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 bg-white transition-colors duration-200">
          <input
            type="radio"
            name={name}
            value="customer"
            checked={value === 'customer'}
            onChange={(e) => onChange(e.target.value as 'customer' | 'provider')}
            className="mr-3 text-slate-700 focus:ring-slate-500"
          />
          <div>
            <div className="font-medium text-slate-900 text-sm">Customer</div>
            <div className="text-xs text-slate-600">Find and hire service providers</div>
          </div>
        </label>
        <label className="flex items-center p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 bg-white transition-colors duration-200">
          <input
            type="radio"
            name={name}
            value="provider"
            checked={value === 'provider'}
            onChange={(e) => onChange(e.target.value as 'customer' | 'provider')}
            className="mr-3 text-slate-700 focus:ring-slate-500"
          />
          <div>
            <div className="font-medium text-slate-900 text-sm">Provider</div>
            <div className="text-xs text-slate-600">Offer your services</div>
          </div>
        </label>
      </div>
    </div>
  );
};


/**
 * AuthFormHeader Component
 * 
 * Consistent header for authentication forms with icon, title, and description.
 * Extracted from LoginForm and RegisterForm.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AuthFormHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  linkLabel?: string;
}

export const AuthFormHeader: React.FC<AuthFormHeaderProps> = ({
  icon: Icon,
  title,
  description,
  linkText,
  linkHref,
  linkLabel,
}) => {
  return (
    <div className="text-center mb-8">
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-slate-600" strokeWidth={2} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">{title}</h2>
      <p className="text-sm text-slate-600 leading-normal">{description}</p>
      {linkText && linkHref && linkLabel && (
        <p className="mt-4 text-sm text-slate-600">
          {linkText}{' '}
          <Link to={linkHref} className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200">
            {linkLabel}
          </Link>
        </p>
      )}
    </div>
  );
};


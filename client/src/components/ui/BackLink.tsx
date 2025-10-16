/**
 * BackLink Component
 * 
 * Standardized back navigation link following design system.
 * Extracted from RequestDetail and other pages.
 * 
 * Usage:
 * <BackLink to="/requests">Back to My Requests</BackLink>
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface BackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const BackLink: React.FC<BackLinkProps> = ({
  to,
  children,
  className = '',
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 transition-colors duration-200 mb-4 ${className}`}
    >
      <ChevronLeft className="w-4 h-4" strokeWidth={2} />
      <span>{children}</span>
    </Link>
  );
};


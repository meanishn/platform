// client/src/components/ui/ContactLinkCard.tsx
// Reusable component for clickable contact information cards
// Used for phone, email, and address links with icons
// Extracted from JobDetailsModal to standardize contact card styling

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ContactLinkCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  rightIcon?: LucideIcon;
  target?: string;
  rel?: string;
  className?: string;
}

export const ContactLinkCard: React.FC<ContactLinkCardProps> = ({
  icon: IconComponent,
  label,
  value,
  href,
  rightIcon: RightIcon,
  target,
  rel,
  className = '',
}) => {
  return (
    <a 
      href={href}
      target={target}
      rel={rel}
      className={`flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors ${className}`}
    >
      <IconComponent className="w-5 h-5 text-slate-600 flex-shrink-0" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-600 text-xs">{label}</p>
        <p className="text-slate-900 font-medium truncate">{value}</p>
      </div>
      {RightIcon && (
        <RightIcon className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={2} />
      )}
    </a>
  );
};


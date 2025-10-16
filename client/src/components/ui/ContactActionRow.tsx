/**
 * ContactActionRow Component
 * Row displaying contact info with an action button
 * Extracted from ActiveJobCard, UpcomingJobCard customer contact sections
 * 
 * Pattern: <Icon + Value> [Action Button]
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface ContactActionRowProps {
  icon: LucideIcon;
  value: string;
  action: {
    label: string;
    href: string;
  };
  truncate?: boolean;
}

export const ContactActionRow: React.FC<ContactActionRowProps> = ({
  icon: Icon,
  value,
  action,
  truncate = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-slate-700 flex items-center gap-1.5 ${truncate ? 'truncate' : ''}`}>
        <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" strokeWidth={2} />
        <span className={truncate ? 'truncate' : ''}>{value}</span>
      </span>
      <a href={action.href} className="flex-shrink-0">
        <Button size="sm" variant="outline">{action.label}</Button>
      </a>
    </div>
  );
};


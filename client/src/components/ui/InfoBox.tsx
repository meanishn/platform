// client/src/components/ui/InfoBox.tsx
// Reusable component for displaying labeled information in a box format
// Used for details like Location, Duration, Date, Rate in modal and detail views
// Extracted from JobDetailsModal to reduce repetition

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InfoBoxProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  icon: IconComponent,
  label,
  value,
  className = '',
}) => {
  return (
    <div className={`bg-slate-50 rounded-lg p-3 border border-slate-200 ${className}`}>
      <p className="text-slate-600 text-sm mb-1 flex items-center gap-1.5">
        <IconComponent className="w-4 h-4" strokeWidth={2} />
        {label}
      </p>
      <p className="text-slate-900 font-medium">
        {value}
      </p>
    </div>
  );
};


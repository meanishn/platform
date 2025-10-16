/**
 * BulkActionBanner Component
 * 
 * Displays bulk action controls when items are selected.
 * Reusable pattern for any list with bulk operations.
 * Extracted from Notifications.tsx following design system.
 */

import React from 'react';
import { Button } from './Button';
import { Check, Trash2, X } from 'lucide-react';

export interface BulkActionBannerProps {
  selectedCount: number;
  onMarkAsRead?: () => void;
  onDelete: () => void;
  onDeselectAll: () => void;
  variant?: 'info' | 'warning';
}

export const BulkActionBanner: React.FC<BulkActionBannerProps> = ({
  selectedCount,
  onMarkAsRead,
  onDelete,
  onDeselectAll,
  variant = 'info',
}) => {
  const bgColor = variant === 'info' ? 'bg-blue-50' : 'bg-amber-50';
  const borderColor = variant === 'info' ? 'border-blue-200' : 'border-amber-200';
  const textColor = variant === 'info' ? 'text-blue-900' : 'text-amber-900';

  return (
    <div className={`mb-4 p-4 ${bgColor} border ${borderColor} rounded-lg`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${textColor}`}>
          {selectedCount} item(s) selected
        </span>
        <div className="flex flex-wrap gap-2">
          {onMarkAsRead && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onMarkAsRead}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Mark as read</span>
              <span className="sm:hidden">Read</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant="danger" 
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2} />
            <span>Delete</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDeselectAll}
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Deselect all</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
};


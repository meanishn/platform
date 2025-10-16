/**
 * StatusTimeline Component
 * 
 * Displays a timeline of request status changes.
 * Shows key events: created, assigned, started, completed.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Card } from '../ui';
import { Check } from 'lucide-react';
import type { ServiceRequestDetailDto } from '../../types/api';

export interface StatusTimelineProps {
  request: ServiceRequestDetailDto;
  className?: string;
}

interface TimelineEvent {
  label: string;
  date: Date;
  colorClass: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  request,
  className = '',
}) => {
  const events: TimelineEvent[] = [
    {
      label: 'Request Created',
      date: new Date(request.createdAt),
      colorClass: 'bg-blue-100 text-blue-600',
    },
  ];

  if (request.assignedAt) {
    events.push({
      label: 'Provider Assigned',
      date: new Date(request.assignedAt),
      colorClass: 'bg-purple-100 text-purple-600',
    });
  }

  if (request.startedAt) {
    events.push({
      label: 'Work Started',
      date: new Date(request.startedAt),
      colorClass: 'bg-amber-100 text-amber-600',
    });
  }

  if (request.completedAt) {
    events.push({
      label: 'Work Completed',
      date: new Date(request.completedAt),
      colorClass: 'bg-emerald-100 text-emerald-600',
    });
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Status Timeline</h3>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 ${event.colorClass} rounded-full flex items-center justify-center`}>
                <Check className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{event.label}</p>
                <p className="text-sm text-slate-600">{event.date.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


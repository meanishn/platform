import React from 'react';
import { Badge } from './Modal';
import { FileText, Lightbulb, CheckCircle2, DollarSign, RefreshCw, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ActivityItemProps {
  id: string | number;
  type: 'request_created' | 'proposal_received' | 'job_completed' | 'payment' | 'status_change' | string;
  title: string;
  description: string;
  timestamp: string | Date;
  urgency?: 'high' | 'medium' | 'low';
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityListProps {
  activities: ActivityItemProps[];
  emptyMessage?: string;
  emptyDescription?: string;
  showBadges?: boolean;
}

const getActivityIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'request_created': return FileText;
    case 'proposal_received': return Lightbulb;
    case 'job_completed': return CheckCircle2;
    case 'payment': return DollarSign;
    case 'status_change': return RefreshCw;
    default: return ClipboardList;
  }
};

const getUrgencyVariant = (urgency?: string): 'danger' | 'warning' | 'success' | 'default' => {
  switch (urgency) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'default';
  }
};

const getStatusVariant = (status?: string): 'warning' | 'info' | 'primary' | 'success' | 'default' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'accepted': return 'info';
    case 'in_progress': return 'primary';
    case 'completed': return 'success';
    default: return 'default';
  }
};

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  emptyMessage = 'No recent activity',
  emptyDescription = 'Your activity will appear here',
  showBadges = false
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-8 h-8 text-slate-400" strokeWidth={2} />
        </div>
        <p className="text-slate-700 font-medium mb-1">{emptyMessage}</p>
        <p className="text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = getActivityIcon(activity.type);
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <IconComponent className="w-5 h-5 text-slate-600" strokeWidth={2} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2 mb-1">
                <p className="text-sm font-medium text-slate-900 flex-1 min-w-0 truncate">
                  {activity.title}
                </p>
                {showBadges && (
                  <div className="flex gap-1 flex-shrink-0">
                    {activity.urgency && (
                      <Badge variant={getUrgencyVariant(activity.urgency)} size="sm">
                        {activity.urgency}
                      </Badge>
                    )}
                    {activity.status && (
                      <Badge variant={getStatusVariant(activity.status)} size="sm">
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-700 mb-1 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(activity.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

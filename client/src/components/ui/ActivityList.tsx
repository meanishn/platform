import React from 'react';
import { Badge } from './Modal';

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

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'request_created': return '📝';
    case 'proposal_received': return '💡';
    case 'job_completed': return '✅';
    case 'payment': return '💰';
    case 'status_change': return '🔄';
    default: return '📋';
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
        <div className="text-black/40 text-5xl mb-3">📋</div>
        <p className="text-black/70 font-medium mb-1">{emptyMessage}</p>
        <p className="text-sm text-black/50">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center border border-black/20">
              <span className="text-base">{getActivityIcon(activity.type)}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 mb-1">
              <p className="text-sm font-medium text-black flex-1 min-w-0 truncate">
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
            <p className="text-sm text-black/70 mb-1 line-clamp-2">
              {activity.description}
            </p>
            <p className="text-xs text-black/50">
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
      ))}
    </div>
  );
};

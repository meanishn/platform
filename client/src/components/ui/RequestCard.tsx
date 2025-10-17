/**
 * RequestCard Component
 * Flexible card component for displaying service requests
 * Works for both customer (MyRequests) and provider (AvailableJobs) views
 */

import React from 'react';
import { MapPin, Clock, Calendar, DollarSign } from 'lucide-react';
import { Card, Button, JobDetailItem, UrgencyBadge, StatusBadge } from './';
import type { ServiceRequestListItemDto } from '../../types/api';

export interface RequestCardAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  className?: string;
}

export interface RequestCardProps {
  /** Request data */
  request: ServiceRequestListItemDto;
  
  /** View mode: 'customer' shows customer-specific info, 'provider' shows provider-specific info */
  viewMode?: 'customer' | 'provider';
  
  /** Primary action button */
  primaryAction?: RequestCardAction;
  
  /** Secondary actions */
  secondaryActions?: RequestCardAction[];
  
  /** Top badge (custom) */
  topBadge?: React.ReactNode;
  
  /** Show status badge */
  showStatusBadge?: boolean;
  
  /** Additional content to render below details */
  additionalContent?: React.ReactNode;
  
  /** Additional className */
  className?: string;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  viewMode = 'customer',
  primaryAction,
  secondaryActions = [],
  topBadge,
  showStatusBadge = true,
  additionalContent,
  className = '',
}) => {
  // Determine labels based on view mode
  const labels = {
    location: viewMode === 'customer' ? 'Service Location' : 'Location',
    duration: viewMode === 'customer' ? 'Est. Duration' : 'Duration',
    preferred: viewMode === 'customer' ? 'Preferred Date' : 'Preferred',
    rate: viewMode === 'customer' ? 'Estimated Cost' : 'Rate',
  };

  return (
    <Card 
      className={`p-4 md:p-6 hover:border-primary-400/50 transition-all duration-300 ${className}`}
    >
      {/* Top Section: Status Badge */}
      {(topBadge || showStatusBadge) && (
        <div className="flex items-center justify-between mb-4">
          {showStatusBadge && <StatusBadge status={request.status} />}
          {topBadge}
        </div>
      )}

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-2 flex items-center gap-2 flex-wrap">
          {request.title}
          {request.urgency && <UrgencyBadge urgency={request.urgency} />}
        </h3>
        <p className="text-sm md:text-base text-white/70 line-clamp-2">
          {request.description}
        </p>
      </div>

      {/* Request Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-white/10">
        <JobDetailItem 
          label={labels.location} 
          value={request.address} 
          icon={MapPin} 
        />
        <JobDetailItem 
          label={labels.duration} 
          value={`${request.estimatedHours || 'TBD'}h`} 
          icon={Clock} 
        />
        <JobDetailItem 
          label={labels.preferred} 
          value={
            request.preferredDate 
              ? new Date(request.preferredDate).toLocaleDateString() 
              : 'Flexible'
          } 
          icon={Calendar} 
        />
        <JobDetailItem 
          label={labels.rate} 
          value={
            viewMode === 'customer'
              ? `$${((request.tier?.baseHourlyRate || 0) * (request.estimatedHours || 0)).toFixed(0)}`
              : `$${request.tier?.baseHourlyRate || 'N/A'}/hr`
          } 
          icon={DollarSign} 
        />
      </div>

      {/* Additional Content */}
      {additionalContent}

      {/* Action Buttons */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'primary'}
              disabled={primaryAction.disabled}
              className={`flex-1 sm:flex-none ${primaryAction.className || ''}`}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions.map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              disabled={action.disabled}
              className={`flex-1 sm:flex-none ${action.className || ''}`}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};

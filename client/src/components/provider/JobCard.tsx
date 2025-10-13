/**
 * JobCard Component
 * Reusable card for displaying job listings
 */

import React from 'react';
import { Card, Button, JobDetailItem, UrgencyBadge, StatusBadge } from '../ui';
import { MatchBadge } from './MatchBadge';
import type { JobDto } from '../../types/api';

export interface JobCardProps {
  /** Job data */
  job: JobDto;
  /** Primary action */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
  };
  /** Secondary actions */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
  }>;
  /** Show match badge */
  showMatchBadge?: boolean;
  /** Show status badge */
  showStatusBadge?: boolean;
  /** Top-right badge (custom) */
  topBadge?: React.ReactNode;
  /** Additional content below details */
  additionalContent?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  primaryAction,
  secondaryActions = [],
  showMatchBadge = true,
  showStatusBadge = true,
  topBadge,
  additionalContent,
  className = '',
}) => {
  return (
    <Card 
      className={`p-4 md:p-6 hover:border-primary-400/50 transition-all duration-300 ${className}`}
    >
      {/* Top Badge Section */}
      {(topBadge || showStatusBadge) && (
        <div className="flex items-center justify-between mb-4">
          {showStatusBadge && <StatusBadge status={job.status} />}
          {topBadge}
        </div>
      )}

      {/* Match Badge - Prominent at top */}
      {showMatchBadge && (job.matchScore || job.rank || job.distanceMiles) && (
        <div className="mb-4">
          <MatchBadge
            score={job.matchScore}
            rank={job.rank}
            distance={job.distanceMiles}
          />
        </div>
      )}

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-2 flex items-center gap-2 flex-wrap">
          {job.title}
          {job.urgency && <UrgencyBadge urgency={job.urgency} />}
        </h3>
        <p className="text-sm md:text-base text-white/70 line-clamp-2">
          {job.description}
        </p>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-white/10">
        <JobDetailItem label="Location" value={job.address} icon="📍" />
        <JobDetailItem label="Duration" value={`${job.estimatedHours || 'TBD'}h est.`} icon="⏱️" />
        <JobDetailItem 
          label="Preferred" 
          value={job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'} 
          icon="📅" 
        />
        <JobDetailItem label="Rate" value={`$${job.tier?.baseHourlyRate || 'N/A'}/hr`} icon="💵" />
      </div>

      {/* Additional Content */}
      {additionalContent}

      {/* Actions */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          {primaryAction && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              variant={primaryAction.variant || 'primary'}
              disabled={primaryAction.disabled}
              className="flex-1 sm:flex-none"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions.map((action, idx) => (
            <Button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              variant={action.variant || 'outline'}
              disabled={action.disabled}
              className="flex-1 sm:flex-none"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};

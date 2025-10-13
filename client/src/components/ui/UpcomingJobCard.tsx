/**
 * UpcomingJobCard Component
 * Displays an upcoming assigned job with start time, customer details, and action buttons
 * Used in the Active Work section for jobs that are assigned but not started
 */

import React, { useMemo } from 'react';
import { Button } from './Button';
import { format } from 'date-fns';

interface CustomerInfo {
  name: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  notes?: string;
}

interface UpcomingJobCardProps {
  id: number;
  title: string;
  location: string;
  startTime: string; // ISO date string
  estimatedHours?: number;
  hourlyRate?: number;
  tierName?: string;
  customer: CustomerInfo;
  distanceFromCurrent?: string; // e.g., "15 min drive"
  onStart: () => void;
  onViewDetails: () => void;
  onCancel: () => void;
  compact?: boolean; // For split-screen view
}

export const UpcomingJobCard: React.FC<UpcomingJobCardProps> = ({
  id,
  title,
  location,
  startTime,
  estimatedHours,
  hourlyRate,
  tierName,
  customer,
  distanceFromCurrent,
  onStart,
  onViewDetails,
  onCancel,
  compact = false,
}) => {
  // Calculate time until start
  const timeUntilStart = useMemo(() => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return { text: 'Ready to start', canStart: true, isUrgent: false };
    } else if (diffHours < 1) {
      return { 
        text: `In ${Math.round(diffHours * 60)} minutes`, 
        canStart: false,
        isUrgent: true 
      };
    } else if (diffHours < 24) {
      return { 
        text: `In ${Math.round(diffHours)} hours`, 
        canStart: false,
        isUrgent: diffHours < 2 
      };
    } else {
      const days = Math.round(diffHours / 24);
      return { 
        text: `In ${days} day${days > 1 ? 's' : ''}`, 
        canStart: false,
        isUrgent: false 
      };
    }
  }, [startTime]);

  const formattedTime = useMemo(() => {
    return format(new Date(startTime), 'h:mm a');
  }, [startTime]);

  const formattedDate = useMemo(() => {
    return format(new Date(startTime), 'MMM d, yyyy');
  }, [startTime]);

  if (compact) {
    // Compact view for split-screen layout
    return (
      <div className="border-2 border-green-500/30 rounded-lg p-4 bg-green-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-black truncate mb-1">{title}</h3>
            <p className="text-sm text-black/60">#{id}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-black/70">
            <span>📅</span>
            <span>Start: {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-black/70">
            <span>⏰</span>
            <span className={timeUntilStart.isUrgent ? 'text-orange-600 font-semibold' : ''}>
              {timeUntilStart.text}
            </span>
          </div>
          <div className="flex items-center gap-2 text-black/70">
            <span>📍</span>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-black/70">
            <span>👤</span>
            <span>
              {customer.name} {customer.rating && `⭐ ${customer.rating}`}
            </span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-black/70">
              <span>📞</span>
              <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                {customer.phone}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onViewDetails} variant="outline" size="sm" className="flex-1">
            View
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Full view for focus mode
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-black mb-1">{title}</h2>
            <p className="text-sm text-black/60">Request #{id}</p>
          </div>
          <div className="ml-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              timeUntilStart.isUrgent 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              📋 {timeUntilStart.isUrgent ? 'URGENT - Starts Soon!' : 'Upcoming'}
            </span>
          </div>
        </div>

        {/* Time Information */}
        <div className={`rounded-lg p-4 mb-4 ${
          timeUntilStart.isUrgent ? 'bg-orange-50' : 'bg-green-50'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-black/60 mb-1">📅 Scheduled Time</p>
              <p className="font-semibold text-black">{formattedDate}</p>
              <p className="text-black/70">{formattedTime}</p>
            </div>
            <div>
              <p className="text-black/60 mb-1">⏰ Time Until Start</p>
              <p className={`font-semibold ${timeUntilStart.isUrgent ? 'text-orange-700' : 'text-black'}`}>
                {timeUntilStart.text}
              </p>
            </div>
            {estimatedHours && (
              <div>
                <p className="text-black/60 mb-1">⏱️ Estimated Duration</p>
                <p className="font-semibold text-black">{estimatedHours} hours</p>
              </div>
            )}
          </div>
        </div>

        {/* Rate Information */}
        {(hourlyRate || tierName) && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span>💵</span>
              <span className="font-semibold text-black">
                ${hourlyRate}/hour
              </span>
              {tierName && (
                <span className="text-black/60">({tierName} Tier)</span>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">📍</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-black mb-1">{location}</p>
              <div className="flex flex-wrap gap-3">
                {distanceFromCurrent && (
                  <span className="text-sm text-black/60">🚗 {distanceFromCurrent}</span>
                )}
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  🗺️ Open in Maps
                </a>
                <a 
                  href={`https://maps.google.com/?daddr=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-black mb-3">Customer</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-black/70">👤 {customer.name}</span>
              {customer.rating && (
                <span className="text-sm text-black/60">
                  ⭐ {customer.rating} {customer.reviewCount && `(${customer.reviewCount} reviews)`}
                </span>
              )}
            </div>
            
            {customer.phone && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/70">📞 {customer.phone}</span>
                <a href={`tel:${customer.phone}`}>
                  <Button size="sm" variant="outline">Call</Button>
                </a>
              </div>
            )}
            
            {customer.email && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/70 truncate">📧 {customer.email}</span>
                <a href={`mailto:${customer.email}`}>
                  <Button size="sm" variant="outline">Message</Button>
                </a>
              </div>
            )}

            {customer.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-black/60 mb-1">Notes:</p>
                <p className="text-sm text-black/80 italic">"{customer.notes}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {timeUntilStart.canStart && (
            <Button onClick={onStart} className="flex-1 sm:flex-initial">
              Start Now
            </Button>
          )}
          {!timeUntilStart.canStart && (
            <Button onClick={onStart} variant="outline" className="flex-1 sm:flex-initial">
              Start Early
            </Button>
          )}
          <Button onClick={onViewDetails} variant="outline" className="flex-1 sm:flex-initial">
            View Full Details
          </Button>
          <Button onClick={onCancel} variant="danger" className="flex-1 sm:flex-initial">
            Cancel Assignment
          </Button>
        </div>

        {/* Warning if not ready */}
        {!timeUntilStart.canStart && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ This job is scheduled for later. Make sure to finish any current work first before starting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

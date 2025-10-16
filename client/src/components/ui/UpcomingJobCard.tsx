/**
 * UpcomingJobCard Component
 * Displays an upcoming assigned job with start time, customer details, and action buttons
 * Used in the Active Work section for jobs that are assigned but not started
 */

import React, { useMemo } from 'react';
import { Button } from './Button';
import { DetailRow } from './DetailRow';
import { ContactActionRow } from './ContactActionRow';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Phone, Mail, DollarSign, ClipboardList, AlertTriangle, Car, Navigation, Zap, FileText, X } from 'lucide-react';

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
  description?: string;
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
  // id prop kept in interface for parent components but not used in display
  title,
  description,
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
      <div className="border-2 border-emerald-500/30 rounded-lg p-4 bg-emerald-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 truncate leading-normal">{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <DetailRow icon={Calendar}>Start: {formattedTime}</DetailRow>
          <DetailRow icon={Clock}>
            <span className={timeUntilStart.isUrgent ? 'text-amber-600 font-semibold' : ''}>
              {timeUntilStart.text}
            </span>
          </DetailRow>
          <DetailRow icon={MapPin}>
            <span className="truncate">{location}</span>
          </DetailRow>
          <DetailRow icon={User}>
            {customer.name} {customer.rating && `★ ${customer.rating}`}
          </DetailRow>
          {customer.phone && (
            <DetailRow icon={Phone}>
              <a href={`tel:${customer.phone}`} className="text-slate-700 hover:text-slate-900 hover:underline">
                {customer.phone}
              </a>
            </DetailRow>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onViewDetails} variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5" strokeWidth={2} />
            <span>View</span>
          </Button>
          <Button onClick={onCancel} variant="danger" size="sm" className="flex items-center justify-center gap-1.5">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Cancel</span>
          </Button>
        </div>
      </div>
    );
  }

  // Full view for focus mode
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
            {description && (
              <p className="text-sm text-slate-600 truncate leading-normal">{description}</p>
            )}
          </div>
          <div className="ml-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
              timeUntilStart.isUrgent 
                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{timeUntilStart.isUrgent ? 'URGENT - Starts Soon!' : 'Upcoming'}</span>
            </span>
          </div>
        </div>

        {/* Time Information */}
        <div className={`rounded-lg p-4 mb-4 border ${
          timeUntilStart.isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" strokeWidth={2} />
                <span>Scheduled Time</span>
              </p>
              <p className="font-semibold text-slate-900">{formattedDate}</p>
              <p className="text-slate-700">{formattedTime}</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span>Time Until Start</span>
              </p>
              <p className={`font-semibold ${timeUntilStart.isUrgent ? 'text-amber-700' : 'text-slate-900'}`}>
                {timeUntilStart.text}
              </p>
            </div>
            {estimatedHours && (
              <div>
                <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span>Estimated Duration</span>
                </p>
                <p className="font-semibold text-slate-900">{estimatedHours} hours</p>
              </div>
            )}
          </div>
        </div>

        {/* Rate Information */}
        {(hourlyRate || tierName) && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="font-semibold text-slate-900">
                ${hourlyRate}/hour
              </span>
              {tierName && (
                <span className="text-slate-600">({tierName} Tier)</span>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-slate-600 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 mb-1">{location}</p>
              <div className="flex flex-wrap gap-3">
                {distanceFromCurrent && (
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{distanceFromCurrent}</span>
                  </span>
                )}
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-700 hover:text-slate-900 hover:underline"
                >
                  Open in Maps
                </a>
                <a 
                  href={`https://maps.google.com/?daddr=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Customer</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <DetailRow icon={User}>{customer.name}</DetailRow>
              {customer.rating && (
                <span className="text-sm text-slate-600">
                  ★ {customer.rating} {customer.reviewCount && `(${customer.reviewCount} reviews)`}
                </span>
              )}
            </div>
            
            {customer.phone && (
              <ContactActionRow
                icon={Phone}
                value={customer.phone}
                action={{ label: 'Call', href: `tel:${customer.phone}` }}
              />
            )}
            
            {customer.email && (
              <ContactActionRow
                icon={Mail}
                value={customer.email}
                action={{ label: 'Message', href: `mailto:${customer.email}` }}
                truncate
              />
            )}

            {customer.notes && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Notes:</p>
                <p className="text-sm text-slate-700 italic">"{customer.notes}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {timeUntilStart.canStart && (
            <Button onClick={onStart} variant="primary" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" strokeWidth={2} />
              <span>Start Now</span>
            </Button>
          )}
          {!timeUntilStart.canStart && (
            <Button onClick={onStart} variant="primary" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" strokeWidth={2} />
              <span>Start Early</span>
            </Button>
          )}
          <Button onClick={onViewDetails} variant="outline" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={2} />
            <span>View Full Details</span>
          </Button>
          <Button onClick={onCancel} variant="danger" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
            <X className="w-4 h-4" strokeWidth={2} />
            <span>Cancel Assignment</span>
          </Button>
        </div>

        {/* Warning if not ready */}
        {!timeUntilStart.canStart && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={2} />
              <span>This job is scheduled for later. Make sure to finish any current work first before starting.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

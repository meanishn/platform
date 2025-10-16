/**
 * ActiveJobCard Component
 * Displays an in-progress job with timer, customer details, and action buttons
 * Used in the Active Work section for ongoing jobs
 */

import React, { useMemo } from 'react';
import { Button } from './Button';
import { DetailRow } from './DetailRow';
import { ContactActionRow } from './ContactActionRow';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Hourglass, MapPin, User, Phone, Mail, CheckCircle, Hammer, Target, FileText, AlertTriangle } from 'lucide-react';

interface CustomerInfo {
  name: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  notes?: string;
}

interface ActiveJobCardProps {
  id: number;
  title: string;
  description?: string;
  location: string;
  startedAt: string;
  estimatedHours?: number;
  customer: CustomerInfo;
  onComplete: () => void;
  onViewDetails: () => void;
  onCancel: () => void;
  compact?: boolean; // For split-screen view
}

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({
  // id prop kept in interface for parent components but not used in display
  title,
  description,
  location,
  startedAt,
  estimatedHours,
  customer,
  onComplete,
  onViewDetails,
  onCancel,
  compact = false,
}) => {
  // Calculate time elapsed and remaining
  const timeInfo = useMemo(() => {
    const start = new Date(startedAt);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    const elapsed = formatDistanceToNow(start, { addSuffix: false });
    
    if (estimatedHours) {
      const remainingHours = Math.max(0, estimatedHours - elapsedHours);
      const remaining = remainingHours >= 1 
        ? `${Math.round(remainingHours)}h left`
        : `${Math.round(remainingHours * 60)}m left`;
      
      return {
        elapsed,
        remaining,
        total: `of ${estimatedHours}h est.`,
      };
    }
    
    return { elapsed };
  }, [startedAt, estimatedHours]);

  if (compact) {
    // Compact view for split-screen layout
    return (
      <div className="border-2 border-amber-500/30 rounded-lg p-4 bg-amber-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 truncate leading-normal">{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <DetailRow icon={Clock}>Started: {timeInfo.elapsed} ago</DetailRow>
          {timeInfo.remaining && (
            <DetailRow icon={Hourglass}>{timeInfo.remaining} {timeInfo.total}</DetailRow>
          )}
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
          <Button onClick={onComplete} variant="primary" size="sm" className="flex-1 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4" strokeWidth={2} />
            <span>Complete</span>
          </Button>
          <Button onClick={onViewDetails} variant="outline" size="sm" className="flex items-center justify-center gap-1.5">
            Details
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium border border-amber-200">
              <Hammer className="w-3.5 h-3.5" strokeWidth={2} />
              <span>In Progress</span>
            </span>
          </div>
        </div>

        {/* Time Information */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span>Started</span>
              </p>
              <p className="font-semibold text-slate-900">{timeInfo.elapsed} ago</p>
            </div>
            {estimatedHours && (
              <>
                <div>
                  <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                    <Hourglass className="w-4 h-4" strokeWidth={2} />
                    <span>Time Remaining</span>
                  </p>
                  <p className="font-semibold text-slate-900">
                    ~{timeInfo.remaining} {timeInfo.total}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4" strokeWidth={2} />
                    <span>Estimated Total</span>
                  </p>
                  <p className="font-semibold text-slate-900">{estimatedHours} hours</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-slate-600 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 mb-1">{location}</p>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-700 hover:text-slate-900 hover:underline"
              >
                Open in Maps
              </a>
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
                action={{ label: 'Call Now', href: `tel:${customer.phone}` }}
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
          <Button onClick={onComplete} variant="primary" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" strokeWidth={2} />
            <span>Complete Job</span>
          </Button>
          <Button onClick={onViewDetails} variant="outline" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={2} />
            <span>View Full Details</span>
          </Button>
          <Button onClick={onCancel} variant="danger" className="flex-1 sm:flex-initial flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            <span>Emergency Cancel</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

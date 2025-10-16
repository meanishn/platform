/**
 * RequestInfoGrid Component
 * 
 * Displays key request information in a grid layout.
 * Shows category, hours, location, dates, and tier information.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Tag, Clock, MapPin, Calendar, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ServiceRequestDetailDto } from '../../types/api';

export interface RequestInfoGridProps {
  request: ServiceRequestDetailDto;
  className?: string;
}

export const RequestInfoGrid: React.FC<RequestInfoGridProps> = ({
  request,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Tag className="w-4 h-4" strokeWidth={2} />
          <span>Category</span>
        </p>
        <p className="text-slate-900">{request.category?.name || `Category ID: ${request.categoryId}`}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Clock className="w-4 h-4" strokeWidth={2} />
          <span>Estimated Hours</span>
        </p>
        <p className="text-slate-900">{request.estimatedHours}h estimated</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" strokeWidth={2} />
          <span>Location</span>
        </p>
        <p className="text-slate-900">{request.address}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" strokeWidth={2} />
          <span>Created</span>
        </p>
        <p className="text-slate-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
      </div>
      
      {request.preferredDate && (
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" strokeWidth={2} />
            <span>Preferred Date</span>
          </p>
          <p className="text-slate-900">{new Date(request.preferredDate).toLocaleDateString()}</p>
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Star className="w-4 h-4" strokeWidth={2} />
          <span>Service Tier</span>
        </p>
        <p className="text-slate-900">{request.tier?.name || `Tier ID: ${request.tierId}`}</p>
      </div>
    </div>
  );
};


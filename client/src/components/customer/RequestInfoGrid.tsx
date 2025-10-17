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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          <span>Category</span>
        </p>
        <p className="text-sm sm:text-base text-slate-900 break-words">{request.category?.name || `Category ID: ${request.categoryId}`}</p>
      </div>
      
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          <span>Estimated Hours</span>
        </p>
        <p className="text-sm sm:text-base text-slate-900">{request.estimatedHours}h estimated</p>
      </div>
      
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          <span>Location</span>
        </p>
        <p className="text-sm sm:text-base text-slate-900 break-words">{request.address}</p>
      </div>
      
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          <span>Created</span>
        </p>
        <p className="text-sm sm:text-base text-slate-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
      </div>
      
      {request.preferredDate && (
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
            <span>Preferred Date</span>
          </p>
          <p className="text-sm sm:text-base text-slate-900">{new Date(request.preferredDate).toLocaleDateString()}</p>
        </div>
      )}
      
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          <span>Service Tier</span>
        </p>
        <p className="text-sm sm:text-base text-slate-900 break-words">{request.tier?.name || `Tier ID: ${request.tierId}`}</p>
      </div>
    </div>
  );
};


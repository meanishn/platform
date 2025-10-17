/**
 * ServiceRequestCard Component
 * 
 * Extracted from MyRequestsNew to encapsulate service request card presentation.
 * Displays a complete service request with status, details, alerts, and actions.
 * Follows design system: status-based styling with clear hierarchy and actions.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../ui';
import { ServiceRequestListItemDto } from '../../types/api';
import { 
  getStatusBadge, 
  getUrgencyBadge, 
  getCardBackground, 
  getAccentBorder 
} from '../../utils/badgeHelpers';
import { 
  Tag, 
  Clock, 
  MapPin, 
  Calendar, 
  FileText, 
  User, 
  Users, 
  CheckCircle, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Star 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ServiceRequestCardProps {
  request: ServiceRequestListItemDto;
  acceptedProviderCount: number;
  onViewProviders: (requestId: number, title: string) => void;
  onCancel: (requestId: number, title: string) => void;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  acceptedProviderCount,
  onViewProviders,
  onCancel,
}) => {
  const navigate = useNavigate();
  
  const hasAcceptedProviders = acceptedProviderCount > 0;
  const isCompleted = request.status === 'completed';
  const isPending = request.status === 'pending';
  const isActive = request.status === 'in_progress' || request.status === 'assigned';

  return (
    <Card 
      className={`${getCardBackground(request.status, request.urgency)} ${getAccentBorder(request.status, request.urgency)} border shadow-md hover:shadow-xl transition-all duration-200`}
    >
      <div className="p-5">
        {/* Header: Title + Priority + Status */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
              {request.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(request.status)}
              {getUrgencyBadge(request.urgency)}
            </div>
          </div>
        </div>

        {/* Body: Description, Category, Time Info */}
        {!isCompleted && (
          <>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {request.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-slate-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Category</p>
                  <p className="text-sm text-slate-900">{request.category.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Duration</p>
                  <p className="text-sm text-slate-900">{request.estimatedHours}h estimated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-slate-600" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Location</p>
                  <p className="text-sm text-slate-900 truncate">{request.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Created</p>
                  <p className="text-sm text-slate-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Collapsed view for completed requests */}
        {isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" strokeWidth={2} />
                  {request.category.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Accepted Providers Alert */}
        {isPending && hasAcceptedProviders && (
          <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <Users className="w-5 h-5 text-emerald-700" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 mb-1">
                  {acceptedProviderCount === 1 
                    ? '1 Provider Ready!'
                    : `${acceptedProviderCount} Providers Ready!`
                  }
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  Review profiles and select the best match for your project.
                </p>
                <Button
                  size="sm"
                  onClick={() => onViewProviders(request.id, request.title)}
                  className="bg-slate-700 text-white hover:bg-slate-800 font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4" strokeWidth={2} />
                  <span>View & Select Provider</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assigned/In Progress Status */}
        {isActive && (
          <div className={`mb-4 p-4 rounded-lg ${
            request.status === 'in_progress' 
              ? 'bg-amber-100 border border-amber-300' 
              : 'bg-blue-100 border border-blue-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                request.status === 'in_progress'
                  ? 'bg-amber-200'
                  : 'bg-blue-200'
              }`}>
                {request.status === 'in_progress' ? (
                  <Wrench className="w-5 h-5 text-amber-700" strokeWidth={2} />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-700" strokeWidth={2} />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {request.status === 'in_progress' ? 'Work in Progress' : 'Provider Confirmed'}
                </p>
                <p className="text-sm text-slate-700">
                  {request.status === 'in_progress' 
                    ? 'Your provider is actively working on this request'
                    : 'Work will begin soon'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Status Banner */}
        {isCompleted && (
          <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" strokeWidth={2} />
            <p className="font-medium text-emerald-900 text-sm">Work Completed</p>
          </div>
        )}

        {/* Footer: Action Buttons with Clear Hierarchy */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
          {/* Primary action based on status */}
          {isPending && hasAcceptedProviders && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onViewProviders(request.id, request.title)}
              className="flex items-center gap-2 font-medium"
            >
              <Users className="w-4 h-4" strokeWidth={2} />
              <span>Select Provider</span>
            </Button>
          )}
          
          {/* Secondary actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/requests/${request.id}`)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
            <span>View Details</span>
          </Button>
          
          {isPending && !hasAcceptedProviders && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewProviders(request.id, request.title)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" strokeWidth={2} />
              <span>Check Providers</span>
            </Button>
          )}
          
          {isCompleted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/requests/${request.id}`)}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" strokeWidth={2} />
              <span>Leave Review</span>
            </Button>
          )}
          
          {/* Destructive action */}
          {isPending && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(request.id, request.title)}
              className="flex items-center gap-2 ml-auto"
            >
              <XCircle className="w-4 h-4" strokeWidth={2} />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};


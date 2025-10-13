/**
 * Service Types
 */

import { ProviderEligibilityStatus } from '../server/src/models/RequestEligibleProvider';
import { CustomerWithContactDto, ProviderWithContactDto, PublicUserDto } from './user';

export type RequestStatus = 'pending' | 'accepted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface ServiceCategoryDto {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface ServiceTierDto {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  baseHourlyRate: number;
  isActive: boolean;
}

// Basic request info
export interface ServiceRequestDto {
  id: number;
  userId: number;
  categoryId: number;
  tierId: number;
  
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  
  preferredDate?: string;
  urgency: UrgencyLevel;
  estimatedHours?: number;
  images?: string[];
  
  status: RequestStatus;
  assignedProviderId?: number;
  assignedAt?: string;
  
  startedAt?: string;
  completedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Request with related data (for detail views)
export interface ServiceRequestDetailDto extends ServiceRequestDto {
  customer: PublicUserDto | CustomerWithContactDto;
  category: ServiceCategoryDto;
  tier: ServiceTierDto;
  assignedProvider?: ProviderWithContactDto;
}

// Provider-specific job detail view (cleaner, no assignedProvider confusion)
export interface ProviderJobDetailDto {
  // Job basic info
  id: number;
  
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  
  preferredDate?: string;
  urgency: UrgencyLevel;
  estimatedHours?: number;
  images?: string[];
  
  status: RequestStatus;
  assignedProviderId?: number;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Customer info with progressive disclosure
  customer: PublicUserDto | CustomerWithContactDto;
  
  // Related data
  category: ServiceCategoryDto;
  tier: ServiceTierDto;
  
  // Provider-specific metadata
  matchScore?: number;
  rank?: number;
  distanceMiles?: number;
  eligibilityStatus?: ProviderEligibilityStatus;
}

// Request list item (for customer/provider dashboards)
export interface ServiceRequestListItemDto {
  id: number;
  title: string;
  description: string;
  address: string;
  status: RequestStatus;
  urgency: UrgencyLevel;
  estimatedHours?: number;
  preferredDate?: string;
  createdAt: string;
  completedAt?: string;
  category: {
    id: number;
    name: string;
    icon?: string;
  };
  tier: {
    id: number;
    name: string;
    baseHourlyRate: number;
  };
}

export interface JobDto extends ServiceRequestListItemDto {
  // NEW: Matching metadata (only present for providers)
  matchScore?: number;      // 0-100 how well provider matches
  distanceMiles?: number;   // Distance from provider location
  rank?: number;            // Provider's rank among all eligible (1=best)
  notifiedAt?: string;
  expiresAt?: string;
}

// Create request payload
export interface CreateServiceRequestDto {
  categoryId: number;
  tierId: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  preferredDate?: string;
  urgency?: UrgencyLevel;
  estimatedHours?: number;
  images?: string[];
}

// Provider assignment types
export interface ProviderAssignmentDto {
  id: number;
  requestId: number;
  providerId: number;
  status: 'pending' | 'accepted' | 'declined';
  notifiedAt: string;
  respondedAt?: string;
  expiresAt?: string;
  
  request: ServiceRequestDetailDto;
}

export interface AcceptAssignmentDto {
  assignmentId: number;
}

export interface DeclineAssignmentDto {
  assignmentId: number;
  reason?: string;
}

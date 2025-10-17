/**
 * Service Request Data Transfer Objects
 * Updated: 2025-10-17 - Added ProviderAssignmentDto and completedAt field
 */

import { PublicUserDto, ProviderWithContactDto } from './user.dto';

export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
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
  customer: PublicUserDto;
  category: ServiceCategoryDto;
  tier: ServiceTierDto;
  assignedProvider?: ProviderWithContactDto;
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


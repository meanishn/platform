// Re-export shared service types
export * from '../../../shared-types/service';

// Additional client-specific service types
export interface ProviderFilters {
  categoryId?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  minRating?: number;
}

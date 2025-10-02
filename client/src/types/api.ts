// Re-export shared types
export * from '../../../shared-types';

// Additional client-specific types
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

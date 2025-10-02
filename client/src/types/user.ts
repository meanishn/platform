// Re-export shared user types
export * from '../../../shared-types/user';

// Additional client-specific user types
export interface Certification {
  name: string;
  issuer: string;
  year: number;
  expirationYear?: number;
  documentUrl?: string;
}

export interface ProviderApplication {
  categoryIds: number[];
  bio: string;
  skills: string[];
  certifications: Certification[];
}

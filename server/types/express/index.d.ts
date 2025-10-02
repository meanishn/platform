import UserModel from '../../src/models/User';
// Express namespace augmentation for req.user
export {};

declare global {
  namespace Express {
    interface User extends UserModel {
    //   id: number;
    //   email: string;
    //   password?: string;
    //   googleId?: string;

    //   // Profile fields
    //   first_name?: string;
    //   last_name?: string;
    //   phone?: string;
    //   address?: string;
    //   latitude?: number;
    //   longitude?: number;
    //   profile_image?: string;

    //   // Role management
    //   is_service_provider: boolean;
    //   is_admin: boolean;
    //   provider_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    //   provider_approved_at?: string;
    //   approved_by?: number;

    //   // Provider specific
    //   provider_bio?: string;
    //   provider_skills?: string[];
    //   provider_certifications?: any[];
    //   average_rating?: number;
    //   total_jobs_completed: number;
    //   total_jobs_declined: number;
    //   response_time_average?: number;
    //   is_available: boolean;

    //   created_at: string;
    //   updated_at: string;

    //   // Helper properties
    //   isApprovedProvider?: boolean;
    //   role: 'customer' | 'provider' | 'admin';
    }
  }
}



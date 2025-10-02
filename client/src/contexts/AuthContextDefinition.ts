import { createContext } from 'react';
import { AuthUserDto, RegisterData, UpdateProfileData } from '../types/user';
import { ApiResponse, AuthResponseDto } from '../types/api';

interface AuthState {
  user: AuthUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<ApiResponse<AuthResponseDto>>;
  register: (userData: RegisterData) => Promise<ApiResponse<AuthResponseDto>>;
  logout: () => Promise<void>;
  updateProfile: (userData: UpdateProfileData) => Promise<ApiResponse<AuthUserDto>>;
  updateUser: (user: AuthUserDto) => void;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

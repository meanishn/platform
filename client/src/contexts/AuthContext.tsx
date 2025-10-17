import React, { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { AuthUserDto, RegisterData, UpdateProfileData } from '../types/user';
import { ApiResponse, AuthResponseDto } from '../types/api';
import { authApi } from '../services/apiService';
import { AuthContext, AuthContextType } from './AuthContextDefinition';
import { ApiError } from '../services/apiClient';

interface AuthState {
  user: AuthUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUserDto | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_AUTH'; payload: { user: AuthUserDto; token: string } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('[AuthReducer] Action:', action.type, 'Current user:', state.user?.email);
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      console.log('[AuthReducer] SET_USER - New user:', action.payload?.email);
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'SET_AUTH':
      console.log('[AuthReducer] SET_AUTH - User:', action.payload.user?.email);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      console.log('[AuthReducer] LOGOUT');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Define verifyToken with useCallback to maintain stable reference
  const verifyToken = useCallback(async () => {
    try {
      console.log('[AuthContext] Verifying token...');
      const response = await authApi.verify();
      
      if (response.success && response.data?.user) {
        console.log('[AuthContext] Token verified successfully, user:', response.data.user.email);
        // Update user data if it has changed
        dispatch({ type: 'SET_USER', payload: response.data.user });
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.error('[AuthContext] Invalid token response:', response);
        throw new Error('Invalid token response');
      }
    } catch (error) {
      // Token is invalid, clear storage and logout
      console.error('[AuthContext] Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      // Check for existing token on app load
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('[AuthContext] Token exists:', !!token, 'Saved user exists:', !!savedUser);
      
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          console.log('[AuthContext] Restoring user from localStorage:', user.email);
          // Set authentication state immediately to prevent redirects
          dispatch({ type: 'SET_AUTH', payload: { user, token } });
          console.log('[AuthContext] User state set, now verifying token...');
          // Then verify token in background
          await verifyToken();
        } catch (error) {
          // Invalid saved data, clear it
          console.error('[AuthContext] Failed to restore auth state:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('[AuthContext] No token or user in localStorage');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, [verifyToken]);

  const refreshAuth = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token) {
      await verifyToken();
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse<AuthResponseDto>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Use status codes for error messages instead of string matching
      let errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      
      if (error instanceof ApiError) {
        // Use HTTP status codes to determine the error message
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid login credentials. Please check your email and password.';
            break;
          case 401:
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 403:
            errorMessage = 'Access denied. Your account may be disabled or suspended.';
            break;
          case 404:
            errorMessage = 'Login service not found. Please contact support.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            // Use server-provided message if available
            errorMessage = error.message || `Login failed with status ${error.status}`;
        }
      } else if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (userData: RegisterData): Promise<ApiResponse<AuthResponseDto>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Use status codes for error messages instead of string matching
      let errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      
      if (error instanceof ApiError) {
        // Use HTTP status codes to determine the error message
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check all required fields.';
            break;
          case 409:
            errorMessage = 'An account with this email already exists. Please login instead.';
            break;
          case 422:
            errorMessage = 'Invalid data format. Please check your information and try again.';
            break;
          case 429:
            errorMessage = 'Too many registration attempts. Please try again later.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            // Use server-provided message if available
            errorMessage = error.message || `Registration failed with status ${error.status}`;
        }
      } else if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: UpdateProfileData): Promise<ApiResponse<AuthUserDto>> => {
    try {
      // Note: This endpoint might not exist yet in the server
      // For now, we'll update the local state
      const currentUser = state.user;
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return {
          success: true,
          data: updatedUser
        };
      }
      return {
        success: false,
        message: 'No user found',
      };
    } catch {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  };

  const updateUser = (user: AuthUserDto): void => {
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
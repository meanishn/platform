/**
 * LoginForm Component
 * 
 * User login form with email/password and Google OAuth.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Button, 
  Input, 
  AlertBanner, 
  GoogleAuthButton, 
  FormDivider, 
  AuthFormHeader 
} from '../ui';
import { Link, useNavigate } from 'react-router-dom';
import { DemoCredentials } from './DemoCredentials';
import { Lock, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'provider':
          navigate('/provider/dashboard', { replace: true });
          break;
        case 'customer':
        default:
          navigate('/dashboard', { replace: true });
          break;
      }
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }

    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success && result.data?.user) {
        // Login successful - redirect will happen via useEffect
        console.log('Login successful, user will be redirected based on role');
      } else {
        setErrors({ general: result.message || 'Login failed' });
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Demo credentials */}
        <DemoCredentials />
        
        {/* Login Card - Following Design System */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-md p-8">
          <AuthFormHeader
            icon={Lock}
            title="Welcome Back"
            description="Sign in to access your account"
            linkText="Don't have an account?"
            linkHref="/register"
            linkLabel="Create one here"
          />

          {errors.general && (
            <AlertBanner
              variant="error"
              title="Login Failed"
              message={errors.general}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign in</span>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <FormDivider />
            <div className="mt-6">
              <GoogleAuthButton mode="signin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

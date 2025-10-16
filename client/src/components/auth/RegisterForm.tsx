import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../ui';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'provider',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await register(formData);
      if (!result.success) {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Registration Card - Following Design System */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-slate-600" strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">Join Our Platform</h2>
            <p className="text-sm text-slate-600 leading-normal">
              Create your account to get started
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Registration Failed</p>
                  <p className="text-sm text-slate-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <div>
          <label className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 bg-white transition-colors duration-200">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={handleChange}
                className="mr-3 text-slate-700 focus:ring-slate-500"
              />
              <div>
                <div className="font-medium text-slate-900 text-sm">Customer</div>
                <div className="text-xs text-slate-600">Find and hire service providers</div>
              </div>
            </label>
            <label className="flex items-center p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 bg-white transition-colors duration-200">
              <input
                type="radio"
                name="role"
                value="provider"
                checked={formData.role === 'provider'}
                onChange={handleChange}
                className="mr-3 text-slate-700 focus:ring-slate-500"
              />
              <div>
                <div className="font-medium text-slate-900 text-sm">Provider</div>
                <div className="text-xs text-slate-600">Offer your services</div>
              </div>
            </label>
          </div>
        </div>

        <Input
          label="Phone Number (Optional)"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <Input
          label="Address (Optional)"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <Button
          type="submit"
          className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              <span>Creating Account...</span>
            </span>
          ) : (
            <span>Create Account</span>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500 text-xs font-medium uppercase tracking-wide">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign up with Google</span>
          </Button>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

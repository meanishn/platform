import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../ui';
import { Link, Navigate } from 'react-router-dom';

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
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join Our Platform</h2>
            <p className="text-emerald-200">
              Create your account to get started
            </p>
            <p className="mt-4 text-sm text-emerald-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-300 hover:text-teal-200 transition-colors duration-200 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-200">{errors.general}</p>
              </div>
            </div>
          )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-white mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 border border-white/30 rounded-xl cursor-pointer hover:bg-white/10 backdrop-blur-sm bg-white/5 transition-all duration-200">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={handleChange}
                className="mr-3 text-emerald-400 focus:ring-emerald-400"
              />
              <div>
                <div className="font-medium text-white">Customer</div>
                <div className="text-sm text-emerald-200">Find and hire service providers</div>
              </div>
            </label>
            <label className="flex items-center p-4 border border-white/30 rounded-xl cursor-pointer hover:bg-white/10 backdrop-blur-sm bg-white/5 transition-all duration-200">
              <input
                type="radio"
                name="role"
                value="provider"
                checked={formData.role === 'provider'}
                onChange={handleChange}
                className="mr-3 text-emerald-400 focus:ring-emerald-400"
              />
              <div>
                <div className="font-medium text-white">Provider</div>
                <div className="text-sm text-emerald-200">Offer your services</div>
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
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border border-emerald-400/30"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white">Creating Account...</span>
            </span>
          ) : (
            <span className="text-white">Create Account</span>
          )}
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-emerald-200">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105 py-3 px-6 rounded-xl backdrop-blur-sm"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            <svg className="w-5 h-5 mr-3 text-white" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-white">Sign up with Google</span>
          </Button>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

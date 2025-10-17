/**
 * RegisterForm Component
 * 
 * User registration form with role selection and Google OAuth.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Button, 
  Input, 
  AlertBanner, 
  GoogleAuthButton, 
  FormDivider, 
  AuthFormHeader, 
  RoleSelector 
} from '../ui';
import { Navigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

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
          <AuthFormHeader
            icon={UserPlus}
            title="Join Our Platform"
            description="Create your account to get started"
            linkText="Already have an account?"
            linkHref="/login"
            linkLabel="Sign in here"
          />

          {errors.general && (
            <AlertBanner
              variant="error"
              title="Registration Failed"
              message={errors.general}
            />
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

        <RoleSelector
          value={formData.role}
          onChange={(role) => setFormData(prev => ({ ...prev, role }))}
          name="role"
        />

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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6">
        <FormDivider />
        <div className="mt-6">
          <GoogleAuthButton mode="signup" />
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

/**
 * Register Page Component
 * User registration with email/password and Google OAuth
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types/auth';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  display_name: z.string().min(1, 'Name is required'),
  company_name: z.string().min(1, 'Company name is required'),
});

const Register: React.FC = () => {
  const { register: registerUser, googleLogin, isLoading, error, clearError } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    clearError();
    try {
      await registerUser(data);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(error || 'Registration failed');
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    setIsGoogleLoading(true);
    try {
      await googleLogin();
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(error || 'Google sign-up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen warehouse-bg flex items-center justify-center px-4 py-12">
      <div className="scanlines"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-black mb-2 neon-text-red">
            BUSINESS GUARDIAN AI
          </h1>
          <p className="text-gray-400 font-mono">Secure Your Warehouse Today</p>
        </div>

        {/* Registration Card */}
        <div className="glow-border rounded-lg p-8 bg-dark-warehouse">
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Create Account
          </h2>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-body text-gray-300 mb-2">
                Full Name
              </label>
              <input
                {...register('display_name')}
                type="text"
                id="display_name"
                className="input-field"
                placeholder="John Doe"
              />
              {errors.display_name && (
                <p className="text-sm text-error mt-1">{errors.display_name.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-body text-gray-300 mb-2">
                Company Name
              </label>
              <input
                {...register('company_name')}
                type="text"
                id="company_name"
                className="input-field"
                placeholder="Acme Corporation"
              />
              {errors.company_name && (
                <p className="text-sm text-error mt-1">{errors.company_name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-body text-gray-300 mb-2">
                Work Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input-field"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="text-sm text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-body text-gray-300 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-error mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Free Tier Info */}
            <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
              <p className="text-xs text-neon-green font-mono">
                ✓ Free tier includes: 100 QR scans/month • Email alerts • 1 user
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-warehouse text-gray-400 font-mono">OR</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full btn-secondary flex items-center justify-center"
          >
            {isGoogleLoading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Connecting...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                Sign up with Google
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400 font-body mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-red-400 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white font-mono text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

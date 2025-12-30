/**
 * useAuth Hook
 * Custom React hook for authentication operations
 */

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  RegisterRequest,
  LoginRequest,
  User,
  Subscription,
} from '../types/auth';

export interface UseAuthReturn {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Helpers
  isPaidUser: boolean;
  isFreeUser: boolean;
  canAccessFeature: (feature: keyof Subscription['features']) => boolean;
}

/**
 * Hook for authentication operations
 */
export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();

  // Get auth state and actions from store
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    register: storeRegister,
    login: storeLogin,
    googleLogin: storeGoogleLogin,
    logout: storeLogout,
    refreshUser,
    clearError,
  } = useAuthStore();

  // Check token validity on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      // Optionally refresh user data on mount
      // refreshUser();
    }
  }, []);

  // Register wrapper with navigation
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        await storeRegister(data);
        navigate('/dashboard');
      } catch (error) {
        // Error is already set in store
        throw error;
      }
    },
    [storeRegister, navigate]
  );

  // Login wrapper with navigation
  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        await storeLogin(data);
        navigate('/dashboard');
      } catch (error) {
        throw error;
      }
    },
    [storeLogin, navigate]
  );

  // Google login wrapper with navigation
  const googleLogin = useCallback(async () => {
    try {
      await storeGoogleLogin();
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [storeGoogleLogin, navigate]);

  // Logout wrapper
  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  // Helper: Check if user is on paid tier
  const isPaidUser = user?.subscription_tier === 'paid';

  // Helper: Check if user is on free tier
  const isFreeUser = user?.subscription_tier === 'free';

  // Helper: Check if user can access a specific feature
  const canAccessFeature = useCallback(
    (feature: keyof Subscription['features']): boolean => {
      if (!user) return false;

      // Paid users have access to all features
      if (user.subscription_tier === 'paid') {
        return true;
      }

      // Free tier feature restrictions
      const freeFeatures: Record<string, boolean> = {
        push_alerts: false,
        advanced_analytics: false,
        api_access: false,
        export_reports: false,
      };

      return freeFeatures[feature] ?? false;
    },
    [user]
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    register,
    login,
    googleLogin,
    logout,
    refreshUser,
    clearError,

    // Helpers
    isPaidUser,
    isFreeUser,
    canAccessFeature,
  };
};

export default useAuth;

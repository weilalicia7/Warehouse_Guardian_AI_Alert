/**
 * Authentication Store (Zustand)
 * Global state management for user authentication
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  AuthState,
  RegisterRequest,
  LoginRequest,
  GoogleAuthRequest,
} from '../types/auth';
import { authService } from '../services/authService';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthStore extends AuthState {
  // Actions
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: authService.getStoredUser(),
        token: authService.getToken(),
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false,
        error: null,

        // Register with email and password
        register: async (data: RegisterRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authService.register(data);

            set({
              user: response.user,
              token: response.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              error: error.message || 'Registration failed',
              isLoading: false,
            });
            throw error;
          }
        },

        // Login with email and password
        login: async (data: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authService.login(data);

            set({
              user: response.user,
              token: response.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              error: error.message || 'Login failed',
              isLoading: false,
            });
            throw error;
          }
        },

        // Google OAuth login
        googleLogin: async () => {
          set({ isLoading: true, error: null });

          try {
            // Sign in with Google via Firebase
            const result = await signInWithPopup(auth, googleProvider);

            // Get Firebase ID token
            const idToken = await result.user.getIdToken();

            // Send ID token to backend for verification
            const authRequest: GoogleAuthRequest = { id_token: idToken };
            const response = await authService.googleAuth(authRequest);

            set({
              user: response.user,
              token: response.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error('Google login error:', error);
            set({
              error: error.message || 'Google login failed',
              isLoading: false,
            });
            throw error;
          }
        },

        // Logout
        logout: () => {
          authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },

        // Refresh user data from backend
        refreshUser: async () => {
          set({ isLoading: true });

          try {
            const user = await authService.getCurrentUser();

            set({
              user,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              error: error.message || 'Failed to refresh user',
              isLoading: false,
            });

            // If refresh fails, logout
            get().logout();
          }
        },

        // Clear error message
        clearError: () => {
          set({ error: null });
        },

        // Set loading state
        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({
          // Only persist these fields
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

export default useAuthStore;

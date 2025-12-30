/**
 * Application Router
 * Defines all public and protected routes with lazy loading
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

// Lazy load pages for code splitting
const Landing = lazy(() => import('../pages/public/Landing'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const Pricing = lazy(() => import('../pages/public/Pricing'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Settings = lazy(() => import('../pages/protected/Settings'));
const Analytics = lazy(() => import('../pages/protected/Analytics'));

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-bg">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-mono">Loading Business Guardian AI...</p>
    </div>
  </div>
);

/**
 * Redirect authenticated users from public pages to dashboard
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Main application router
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ========================================
           * PUBLIC ROUTES
           * ======================================== */}

          {/* Landing Page - First impression with cybersecurity aesthetic */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />

          {/* Authentication Pages */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Pricing Page - Public but shows upgrade for authenticated users */}
          <Route path="/pricing" element={<Pricing />} />

          {/* ========================================
           * PROTECTED ROUTES (Require Authentication)
           * ======================================== */}

          {/* Dashboard - Main app interface */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Settings Page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Analytics - Paid feature */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requirePaid={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* ========================================
           * FALLBACK ROUTES
           * ======================================== */}

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-dark-bg">
                <div className="text-center">
                  <h1 className="text-6xl font-display text-primary mb-4">404</h1>
                  <p className="text-gray-400 font-mono mb-8">Page not found</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;

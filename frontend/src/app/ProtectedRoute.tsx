/**
 * ProtectedRoute Component
 * Route guard that redirects unauthenticated users to login
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePaid?: boolean; // Optional: require paid subscription
}

/**
 * Component to protect routes requiring authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requirePaid = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if paid subscription is required
  if (requirePaid && user?.subscription_tier !== 'paid') {
    // Redirect to pricing page with upgrade prompt
    return <Navigate to="/pricing" state={{ requireUpgrade: true }} replace />;
  }

  // User is authenticated (and has required tier if specified)
  return <>{children}</>;
};

export default ProtectedRoute;

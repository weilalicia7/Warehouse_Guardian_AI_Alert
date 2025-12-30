/**
 * Authentication Type Definitions
 * TypeScript interfaces for user authentication and authorization
 */

export interface User {
  user_id: string;
  email: string;
  display_name: string;
  company_name: string;
  company_id: string;
  subscription_tier: "free" | "paid";
  subscription_status: "active" | "canceled" | "trial" | "past_due";
  auth_provider: "email" | "google";
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  onboarding_completed: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  company_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionFeatures {
  push_alerts: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  export_reports: boolean;
  team_members_limit: number;
  alerts_per_month: number;
  qr_scans_per_month: number;
}

export interface Subscription {
  subscription_id: string;
  company_id: string;
  tier: "free" | "paid";
  status: "active" | "canceled" | "trial" | "past_due";
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  features: SubscriptionFeatures;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
  cancel_at_period_end: boolean;
}

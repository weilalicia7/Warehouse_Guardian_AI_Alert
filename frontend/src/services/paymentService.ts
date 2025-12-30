/**
 * Payment Service
 * Handles Stripe payment integration for subscription upgrades
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ========================================
// Types
// ========================================

export interface CreateCheckoutSessionRequest {
  price_id: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
}

export interface CreatePortalSessionResponse {
  portal_url: string;
}

export interface SubscriptionStatus {
  tier: 'free' | 'paid';
  features: {
    real_time_alerts?: boolean;
    qr_scans_limit?: number;
    advanced_analytics?: boolean;
    team_collaboration?: boolean;
    api_access?: boolean;
    priority_support?: boolean;
  };
  payment_status?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

// ========================================
// Payment Service
// ========================================

class PaymentService {
  /**
   * Create a Stripe checkout session for subscription upgrade
   */
  async createCheckoutSession(
    token: string,
    priceId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CreateCheckoutSessionResponse> {
    const response = await axios.post<CreateCheckoutSessionResponse>(
      `${API_URL}/api/payment/create-checkout-session`,
      {
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      } as CreateCheckoutSessionRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  /**
   * Create a Stripe customer portal session
   * Allows users to manage subscription, payment methods, invoices
   */
  async createPortalSession(token: string): Promise<CreatePortalSessionResponse> {
    const response = await axios.post<CreatePortalSessionResponse>(
      `${API_URL}/api/payment/create-portal-session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(token: string): Promise<SubscriptionStatus> {
    const response = await axios.get<SubscriptionStatus>(
      `${API_URL}/api/payment/subscription-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Redirect to Stripe Checkout
   */
  redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }

  /**
   * Redirect to Stripe Customer Portal
   */
  redirectToPortal(portalUrl: string): void {
    window.location.href = portalUrl;
  }
}

export const paymentService = new PaymentService();
export default paymentService;

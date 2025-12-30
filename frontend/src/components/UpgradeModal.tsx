/**
 * Upgrade Modal Component
 * Prompts free users to upgrade to paid tier for premium features
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap, TrendingUp, Users, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Feature that triggered the upgrade prompt
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature = 'premium features',
}) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Stripe Price ID from environment variable
  const STRIPE_PRICE_ID = process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY || 'price_placeholder';

  // Validate Stripe configuration
  if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'price_your_monthly_price_id_here' || STRIPE_PRICE_ID === 'price_placeholder') {
    console.warn('[UpgradeModal] REACT_APP_STRIPE_PRICE_ID_MONTHLY not configured in .env');
  }

  const handleUpgrade = async () => {
    if (!token) {
      toast.error('Please log in to upgrade');
      return;
    }

    setIsLoading(true);

    try {
      const response = await paymentService.createCheckoutSession(
        token,
        STRIPE_PRICE_ID,
        `${window.location.origin}/dashboard?payment=success`,
        `${window.location.origin}/pricing?payment=cancelled`
      );

      // Redirect to Stripe Checkout
      paymentService.redirectToCheckout(response.checkout_url);
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      toast.error(error.response?.data?.detail || 'Failed to start upgrade process');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-10 bg-dark-warehouse border border-primary rounded-lg max-w-2xl w-full p-8 glow-border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-3xl font-display font-black mb-2 neon-text-red">
            UPGRADE TO PAID TIER
          </h2>

          <p className="text-gray-300 font-body">
            Unlock {feature} and more with our premium plan
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <Zap className="h-6 w-6 text-neon-green flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white">Real-Time Push Alerts</h3>
              <p className="text-gray-400 text-sm">
                Get instant notifications when fraud is detected (87ms response time)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <TrendingUp className="h-6 w-6 text-neon-cyan flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm">
                Predictive threat analysis, custom reports, and data export
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Users className="h-6 w-6 text-neon-orange flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white">Team Collaboration</h3>
              <p className="text-gray-400 text-sm">
                Invite team members, share dashboards, and collaborate on security
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white">Priority Support + API Access</h3>
              <p className="text-gray-400 text-sm">
                24/7 support and programmatic access to your security data
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-black/40 border border-primary/30 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-display font-black text-primary mb-2">
              $99
              <span className="text-lg text-gray-400 font-body">/month</span>
            </div>
            <p className="text-gray-400 font-mono text-sm">
              Unlimited QR scans • Full features • Cancel anytime
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Upgrade Now
              </>
            )}
          </button>

          <Link to="/pricing" className="flex-1 btn-ghost text-center">
            View Full Pricing
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center text-xs text-gray-500 font-mono">
          <p>Secure payment powered by Stripe • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

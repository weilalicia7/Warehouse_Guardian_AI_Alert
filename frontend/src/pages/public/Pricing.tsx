/**
 * Pricing Page Component
 * Freemium pricing tiers with upgrade options
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Pricing: React.FC = () => {
  const { isAuthenticated, isPaidUser } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // TODO: Integrate Stripe payment
    alert('Stripe integration coming soon!');
  };

  return (
    <div className="min-h-screen warehouse-bg py-16 px-4">
      <div className="scanlines"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-black mb-4 neon-text-red">
            PRICING
          </h1>
          <p className="text-xl text-gray-300 font-body">
            Choose the plan that fits your security needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE TIER */}
          <div className="glow-border-green rounded-lg p-8 bg-dark-warehouse">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Free Tier
              </h2>
              <div className="text-4xl font-display font-black text-neon-green mb-2">
                $0
                <span className="text-lg text-gray-400 font-body">/month</span>
              </div>
              <p className="text-gray-400 font-body">Perfect for testing</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">View-only dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">100 QR scans per month</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">Email alerts (24h delay)</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">1 user account</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">✗</span>
                <span className="text-gray-500 font-body line-through">Real-time push alerts</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">✗</span>
                <span className="text-gray-500 font-body line-through">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">✗</span>
                <span className="text-gray-500 font-body line-through">PDF export</span>
              </li>
            </ul>

            {!isAuthenticated && (
              <Link to="/register" className="block w-full btn-secondary text-center">
                Start Free Trial
              </Link>
            )}
          </div>

          {/* PAID TIER */}
          <div className="glow-border rounded-lg p-8 bg-dark-warehouse relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Paid Tier
              </h2>
              <div className="text-4xl font-display font-black text-primary mb-2">
                $99
                <span className="text-lg text-gray-400 font-body">/month</span>
              </div>
              <p className="text-gray-400 font-body">Full warehouse protection</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-white font-body font-semibold">
                  Real-time push alerts ⚡
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">Unlimited QR scans</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">PDF report export</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">Team collaboration (unlimited users)</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">API access</span>
              </li>
              <li className="flex items-start">
                <span className="text-neon-green mr-2">✓</span>
                <span className="text-gray-300 font-body">Priority support</span>
              </li>
            </ul>

            {isAuthenticated && !isPaidUser ? (
              <button onClick={handleUpgrade} className="w-full btn-primary">
                Upgrade Now
              </button>
            ) : !isAuthenticated ? (
              <Link to="/register" className="block w-full btn-primary text-center">
                Start with Paid Tier
              </Link>
            ) : (
              <div className="w-full py-3 text-center text-neon-green font-mono border border-neon-green rounded-lg">
                ✓ Current Plan
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-display font-bold text-white mb-8">
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="card-hover">
              <h4 className="font-body font-bold text-white mb-2">
                Can I upgrade anytime?
              </h4>
              <p className="text-gray-400 text-sm">
                Yes! Upgrade instantly and start receiving real-time push alerts within seconds.
              </p>
            </div>

            <div className="card-hover">
              <h4 className="font-body font-bold text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards via Stripe. Enterprise invoicing available.
              </p>
            </div>

            <div className="card-hover">
              <h4 className="font-body font-bold text-white mb-2">
                Is there a trial for paid features?
              </h4>
              <p className="text-gray-400 text-sm">
                14-day money-back guarantee. Try all paid features risk-free.
              </p>
            </div>

            <div className="card-hover">
              <h4 className="font-body font-bold text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-400 text-sm">
                Yes, cancel anytime. You'll keep access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white font-mono text-sm"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

/**
 * Analytics Page Component (PAID FEATURE)
 * Advanced analytics and reporting dashboard
 * TODO: Implement full analytics in Phase 3
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Analytics: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen warehouse-bg py-8 px-4">
      <div className="scanlines"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-black neon-text-cyan mb-2">
              ADVANCED ANALYTICS
            </h1>
            <p className="text-gray-400 font-mono">
              Paid Feature • Deep insights into security threats
            </p>
          </div>
          <Link to="/dashboard" className="btn-ghost">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Paid Feature Banner */}
        <div className="glow-border-cyan rounded-lg p-8 bg-dark-warehouse text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Advanced Analytics Dashboard
          </h2>
          <p className="text-gray-300 font-body mb-6">
            Unlock powerful insights with predictive threat analysis and custom reports
          </p>

          {user?.subscription_tier === 'paid' ? (
            <div className="inline-block px-4 py-2 bg-neon-cyan/20 border border-neon-cyan rounded-lg">
              <span className="text-neon-cyan font-mono">✓ Access Granted</span>
            </div>
          ) : (
            <Link to="/pricing" className="btn-primary inline-block">
              Upgrade to Access Analytics
            </Link>
          )}
        </div>

        {/* Preview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-hover">
            <h3 className="font-display font-bold text-white mb-2">
              Threat Trends
            </h3>
            <p className="text-gray-400 text-sm font-body">
              Historical analysis of security threats over time
            </p>
          </div>

          <div className="card-hover">
            <h3 className="font-display font-bold text-white mb-2">
              Predictive Alerts
            </h3>
            <p className="text-gray-400 text-sm font-body">
              AI-powered forecasting of potential security breaches
            </p>
          </div>

          <div className="card-hover">
            <h3 className="font-display font-bold text-white mb-2">
              Custom Reports
            </h3>
            <p className="text-gray-400 text-sm font-body">
              Generate detailed PDF reports for stakeholders
            </p>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-prompt">STATUS:</span>
            <span className="text-neon-cyan">Analytics Implementation (Phase 3)</span>
          </div>
          <div className="terminal-text space-y-1">
            <p>[ ] Threat trend charts (Recharts integration)</p>
            <p>[ ] Predictive analytics (Vertex AI integration)</p>
            <p>[ ] Custom report builder</p>
            <p>[ ] Export to PDF, Excel, CSV</p>
            <p>[ ] Date range filtering</p>
            <p>[ ] Comparison mode (time periods)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

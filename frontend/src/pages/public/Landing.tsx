/**
 * Landing Page Component - Enhanced
 * Full commercial website landing page with cybersecurity aesthetic
 * Showcases Business Guardian AI as real-time warehouse security system
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen warehouse-bg">
      {/* Scanline overlay */}
      <div className="scanlines"></div>

      {/* ========================================
       * HERO SECTION (Above the Fold)
       * ======================================== */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Security HUD (top-right) */}
        <div className="absolute top-8 right-8 hud-container hud-corner">
          <div className="flex items-center space-x-2">
            <span className="text-neon-green font-mono text-sm">LIVE DEMO</span>
            <div className="w-2 h-2 bg-neon-green rounded-full pulse-green"></div>
            <span className="text-neon-green font-mono text-sm">REC</span>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="text-center max-w-5xl">
          <h1 className="text-7xl md:text-8xl font-display font-black mb-6 neon-text-red tracking-wider">
            BUSINESS GUARDIAN AI
          </h1>

          <h2 className="text-4xl md:text-5xl font-body font-bold mb-6 text-white">
            Real-Time Warehouse Security AI Alert System
          </h2>

          <p className="text-2xl text-gray-300 mb-4 font-body">
            Stop €37M heists before they happen
          </p>

          <p className="text-lg text-gray-400 mb-10 font-body max-w-3xl mx-auto">
            AI-powered fraud detection with 87ms response time. Protect your warehouse
            with cryptographic QR verification, IoT sensors, and machine learning.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center mb-12">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Free Trial →
            </Link>
            <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 text-sm font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-neon-green">✓</span>
              50,000+ devices protected
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neon-cyan">✓</span>
              98.5/100 AI accuracy
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neon-orange">✓</span>
              87ms detection time
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* ========================================
       * CRISIS CONTEXT SECTION
       * ======================================== */}
      <section className="relative z-10 py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4 gradient-text">
              THE WAREHOUSE SECURITY CRISIS
            </h2>
            <p className="text-xl text-gray-300 font-body">
              Traditional security fails to stop modern threats
            </p>
          </div>

          {/* Crisis Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Real-World Case Study */}
            <div className="alert-card">
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-critical text-white text-xs font-bold rounded-full mb-4">
                  CRITICAL
                </div>
                <h3 className="text-5xl font-display font-black text-primary mb-2">€37M</h3>
                <h4 className="text-xl font-body font-bold text-white mb-3">Paris Warehouse Heist (2018)</h4>
                <p className="text-gray-400 text-sm font-body leading-relaxed">
                  A major international e-commerce retailer lost €37 million when employees used fake QR codes to steal luxury goods.
                  Traditional security cameras failed to detect the cryptographic fraud.
                </p>
              </div>
            </div>

            {/* Industry Impact */}
            <div className="alert-card">
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-high text-white text-xs font-bold rounded-full mb-4">
                  HIGH
                </div>
                <h3 className="text-5xl font-display font-black text-neon-orange mb-2">$47.8B</h3>
                <h4 className="text-xl font-body font-bold text-white mb-3">Annual Warehouse Theft</h4>
                <p className="text-gray-400 text-sm font-body leading-relaxed">
                  Global warehouse industry loses $47.8 billion annually to employee theft,
                  cargo theft, and fraud. 75% goes undetected until inventory audits.
                </p>
              </div>
            </div>

            {/* Detection Gap */}
            <div className="alert-card">
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-warning text-white text-xs font-bold rounded-full mb-4">
                  WARNING
                </div>
                <h3 className="text-5xl font-display font-black text-neon-cyan mb-2">72h</h3>
                <h4 className="text-xl font-body font-bold text-white mb-3">Average Detection Delay</h4>
                <p className="text-gray-400 text-sm font-body leading-relaxed">
                  Traditional security takes 72 hours to detect fraud through manual audits.
                  By then, stolen goods are already sold on black markets.
                </p>
              </div>
            </div>
          </div>

          {/* Solution Teaser */}
          <div className="terminal max-w-3xl mx-auto">
            <div className="terminal-header">
              <span className="terminal-prompt">$</span>
              <span className="text-neon-green">solution</span>
            </div>
            <div className="terminal-text">
              <p className="mb-2">
                <span className="text-neon-cyan">Business Guardian AI</span> detects fraud in{' '}
                <span className="text-neon-orange font-bold">87 milliseconds</span> using:
              </p>
              <p>→ Cryptographic QR code verification</p>
              <p>→ Real-time IoT sensor monitoring</p>
              <p>→ Machine learning anomaly detection</p>
              <p>→ Gemini AI-powered intelligent alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
       * HOW IT WORKS (4 Steps)
       * ======================================== */}
      <section className="relative z-10 py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4 neon-text-cyan">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-300 font-body">
              From sensor to alert in under 100 milliseconds
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Step 1 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-display font-black">
                1
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">QR Scan</h3>
              <p className="text-gray-400 text-sm font-body">
                Employee scans QR code on product. System verifies cryptographic signature.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-neon-orange rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-display font-black">
                2
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">IoT Sensors</h3>
              <p className="text-gray-400 text-sm font-body">
                Motion, RFID, weight sensors stream real-time data to Kafka topics.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-display font-black">
                3
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">AI Analysis</h3>
              <p className="text-gray-400 text-sm font-body">
                Flink SQL + Vertex AI analyze patterns. Machine learning detects anomalies.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-neon-green rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-display font-black">
                4
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Instant Alert</h3>
              <p className="text-gray-400 text-sm font-body">
                Gemini AI generates alert. Push notification sent to security team.
              </p>
            </div>
          </div>

          {/* Data Flow Visualization */}
          <div className="bg-dark-warehouse border border-neon-cyan rounded-lg p-8">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="text-neon-green font-mono text-sm mb-1">INPUT</div>
                <div className="text-white font-body">QR + Sensors</div>
              </div>
              <div className="text-neon-cyan text-2xl">→</div>
              <div className="flex-1">
                <div className="text-neon-orange font-mono text-sm mb-1">STREAM</div>
                <div className="text-white font-body">Kafka Topics</div>
              </div>
              <div className="text-neon-cyan text-2xl">→</div>
              <div className="flex-1">
                <div className="text-neon-cyan font-mono text-sm mb-1">PROCESS</div>
                <div className="text-white font-body">Flink + Vertex AI</div>
              </div>
              <div className="text-neon-cyan text-2xl">→</div>
              <div className="flex-1">
                <div className="text-neon-green font-mono text-sm mb-1">OUTPUT</div>
                <div className="text-white font-body">Alert (87ms)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
       * FEATURES GRID (6 Cards)
       * ======================================== */}
      <section className="relative z-10 py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4 neon-text-green">
              FEATURES
            </h2>
            <p className="text-xl text-gray-300 font-body">
              Enterprise-grade security powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: QR Verification */}
            <div className="card-hover">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                QR Cryptographic Verification
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                HMAC-SHA256 signatures prevent counterfeit QR codes. Each scan verified
                against trusted database in real-time.
              </p>
              <div className="inline-block px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-mono rounded">
                PRODUCTION-READY
              </div>
            </div>

            {/* Feature 2: IoT Integration */}
            <div className="card-hover">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                IoT Sensor Integration
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                Connects to motion detectors, RFID readers, weight sensors, cameras.
                Real-time data streaming via Kafka.
              </p>
              <div className="inline-block px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-xs font-mono rounded">
                KAFKA-POWERED
              </div>
            </div>

            {/* Feature 3: ML Fraud Detection */}
            <div className="card-hover">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                ML Fraud Detection
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                Vertex AI models analyze behavioral patterns. Detects anomalies like
                off-hours access, unusual exit routes.
              </p>
              <div className="inline-block px-3 py-1 bg-neon-orange/20 text-neon-orange text-xs font-mono rounded">
                98.5% ACCURACY
              </div>
            </div>

            {/* Feature 4: Gemini AI Alerts */}
            <div className="card-hover">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Gemini AI Intelligent Alerts
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                Context-aware alerts generated by Google Gemini. Actionable recommendations,
                not just notifications.
              </p>
              <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-mono rounded">
                AI-GENERATED
              </div>
            </div>

            {/* Feature 5: Multi-Channel Notifications */}
            <div className="card-hover">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Multi-Channel Notifications
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                Push alerts, email, SMS, dashboard. Paid tier gets real-time push.
                Free tier gets email with 24h delay.
              </p>
              <div className="inline-block px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-mono rounded">
                MULTI-CHANNEL
              </div>
            </div>

            {/* Feature 6: Live Dashboard */}
            <div className="card-hover">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Real-Time Dashboard
              </h3>
              <p className="text-gray-400 text-sm font-body mb-4">
                WebSocket-powered live updates. Monitor all warehouse zones, alert history,
                system health in real-time.
              </p>
              <div className="inline-block px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-xs font-mono rounded">
                WEBSOCKET
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
       * PRICING PREVIEW
       * ======================================== */}
      <section className="relative z-10 py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4 gradient-text">
              SIMPLE PRICING
            </h2>
            <p className="text-xl text-gray-300 font-body">
              Start free, upgrade when you need real-time alerts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glow-border-green rounded-lg p-8 bg-dark-warehouse">
              <h3 className="text-2xl font-display font-bold text-white mb-2">Free Tier</h3>
              <div className="text-5xl font-display font-black text-neon-green mb-6">
                $0<span className="text-lg text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm font-body">
                <li className="flex items-center text-gray-300">
                  <span className="text-neon-green mr-2">✓</span>
                  100 QR scans/month
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-neon-green mr-2">✓</span>
                  Email alerts (24h delay)
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-neon-green mr-2">✓</span>
                  View-only dashboard
                </li>
              </ul>
              <Link to="/register" className="block w-full btn-secondary text-center">
                Start Free
              </Link>
            </div>

            {/* Paid Tier */}
            <div className="glow-border rounded-lg p-8 bg-dark-warehouse relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Paid Tier</h3>
              <div className="text-5xl font-display font-black text-primary mb-6">
                $99<span className="text-lg text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm font-body">
                <li className="flex items-center text-white font-semibold">
                  <span className="text-neon-green mr-2">✓</span>
                  Real-time push alerts ⚡
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-neon-green mr-2">✓</span>
                  Unlimited QR scans
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-neon-green mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>
              <Link to="/pricing" className="block w-full btn-primary text-center">
                View Full Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
       * FINAL CTA
       * ======================================== */}
      <section className="relative z-10 py-20 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-display font-black mb-6 neon-text-red">
            PROTECT YOUR WAREHOUSE TODAY
          </h2>
          <p className="text-xl text-gray-300 font-body mb-10">
            Join 50,000+ protected devices. Start detecting fraud in 87 milliseconds.
          </p>
          <div className="flex gap-6 justify-center">
            <Link to="/register" className="btn-primary text-lg px-10 py-4">
              Start Free Trial →
            </Link>
            <Link to="/pricing" className="btn-ghost text-lg px-10 py-4">
              See Pricing
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-12 border-t border-gray-800">
            <p className="text-gray-500 font-mono text-sm mb-4">POWERED BY</p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 font-body text-sm">
              <span>Google Cloud Platform</span>
              <span>Confluent Kafka</span>
              <span>Apache Flink</span>
              <span>Vertex AI</span>
              <span>Gemini AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500 font-mono text-sm">
          <p>© 2025 Business Guardian AI. Enterprise Warehouse Security.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

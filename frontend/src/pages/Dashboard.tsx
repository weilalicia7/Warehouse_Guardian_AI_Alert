/**
 * Business Guardian AI - Main Dashboard
 * Real-time fraud detection monitoring with JD.com color theme
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingUp, Activity, Bell, Camera, Weight, Cpu } from 'lucide-react';

// Types
interface FraudAlert {
  alert_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  product_name: string;
  location: string;
  threat_score: number;
  timestamp_detected: number;
  requires_action: boolean;
}

interface ThreatMetrics {
  total_alerts: number;
  critical_alerts: number;
  threats_blocked: number;
  avg_threat_score: number;
  qr_scans_today: number;
  fraud_detected_today: number;
}

const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [metrics, setMetrics] = useState<ThreatMetrics>({
    total_alerts: 0,
    critical_alerts: 0,
    threats_blocked: 0,
    avg_threat_score: 0,
    qr_scans_today: 0,
    fraud_detected_today: 0
  });

  // Mock data for demo (replace with Kafka WebSocket consumer in production)
  useEffect(() => {
    // Simulate real-time alerts
    const mockAlerts: FraudAlert[] = [
      {
        alert_id: 'ALERT-001',
        alert_type: 'unauthorized_exit',
        severity: 'critical',
        title: '🚨 Exit Blocked - Invalid QR Code',
        description: 'Product Dell XPS 15 with invalid QR code detected at exit gate. Value: $1,299. Verification failed: signature mismatch.',
        product_name: 'Dell XPS 15 Laptop',
        location: 'Exit Gate A',
        threat_score: 98.5,
        timestamp_detected: Date.now() - 120000,
        requires_action: true
      },
      {
        alert_id: 'ALERT-002',
        alert_type: 'inventory_discrepancy',
        severity: 'critical',
        title: 'Physical-Digital Mismatch',
        description: 'Weight sensors detect 45kg weight drop (30 items missing) but digital records show normal inventory. JD.com attack pattern!',
        product_name: 'iPhone 15 Pro Max',
        location: 'Shelf-A-7',
        threat_score: 95.0,
        timestamp_detected: Date.now() - 300000,
        requires_action: true
      },
      {
        alert_id: 'ALERT-003',
        alert_type: 'suspicious_user',
        severity: 'high',
        title: 'Fraudulent ERP Transaction',
        description: 'User "COMPROMISED-ACCOUNT-X" created suspicious transaction marking 25 items as shipped.',
        product_name: 'iPad Pro 12.9"',
        location: 'Warehouse B',
        threat_score: 87.3,
        timestamp_detected: Date.now() - 600000,
        requires_action: true
      }
    ];

    setAlerts(mockAlerts);
    setMetrics({
      total_alerts: 24,
      critical_alerts: 3,
      threats_blocked: 15,
      avg_threat_score: 78.5,
      qr_scans_today: 1547,
      fraud_detected_today: 8
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default: return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-blue-600'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-600';
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Business Guardian AI</h1>
                <p className="text-primary-100">Real-Time Fraud Detection System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                <Bell className="inline h-5 w-5 mr-2" />
                Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Alerts */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total_alerts}</p>
                <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          {/* Critical Threats */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Threats</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{metrics.critical_alerts}</p>
                <p className="text-sm text-gray-500 mt-1">Requires action</p>
              </div>
              <Shield className="h-12 w-12 text-red-600 opacity-20" />
            </div>
          </div>

          {/* Threats Blocked */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.threats_blocked}</p>
                <p className="text-sm text-gray-500 mt-1">JD.com attacks prevented</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Avg Threat Score */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Threat Score</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.avg_threat_score}</p>
                <p className="text-sm text-gray-500 mt-1">Out of 100</p>
              </div>
              <Activity className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Camera className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Cameras</p>
                <p className="text-sm text-green-600">6 Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Weight className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Weight Sensors</p>
                <p className="text-sm text-green-600">10 Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Cpu className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">RFID Readers</p>
                <p className="text-sm text-green-600">5 Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">ML Model</p>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Fraud Alerts</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{formatTimestamp(alert.timestamp_detected)}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{alert.title}</h3>
                    <p className="text-sm mb-3">{alert.description}</p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="font-semibold">Product:</span> {alert.product_name}
                      </div>
                      <div>
                        <span className="font-semibold">Location:</span> {alert.location}
                      </div>
                      <div>
                        <span className="font-semibold">Threat Score:</span> {alert.threat_score}/100
                      </div>
                    </div>
                  </div>
                  {alert.requires_action && (
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition ml-4">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

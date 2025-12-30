/**
 * Business Guardian AI - Production Dashboard
 * Full-featured demo with real-time monitoring, charts, and comprehensive fraud detection
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Shield, TrendingUp, Activity, Camera, Weight, Cpu,
  Settings, LogOut, Wifi, WifiOff, Bell, Download, Filter,
  MapPin, Clock, DollarSign, Users, BarChart3, Eye
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

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
  value?: number;
}

interface ThreatMetrics {
  total_alerts: number;
  critical_alerts: number;
  threats_blocked: number;
  avg_threat_score: number;
  qr_scans_today: number;
  fraud_detected_today: number;
  total_value_protected: number;
  response_time_ms: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'analytics'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [metrics, setMetrics] = useState<ThreatMetrics>({
    total_alerts: 0,
    critical_alerts: 0,
    threats_blocked: 0,
    avg_threat_score: 0,
    qr_scans_today: 0,
    fraud_detected_today: 0,
    total_value_protected: 0,
    response_time_ms: 87
  });

  // WebSocket connection for real-time alerts
  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'fraud_alert' && message.payload) {
      setAlerts((prev) => [message.payload, ...prev].slice(0, 50));
      setMetrics((prev) => ({
        ...prev,
        total_alerts: prev.total_alerts + 1,
        critical_alerts: message.payload.severity === 'critical' ? prev.critical_alerts + 1 : prev.critical_alerts,
      }));
    }
  });

  // Mock data for production demo
  useEffect(() => {
    const mockAlerts: FraudAlert[] = [
      {
        alert_id: 'ALERT-001',
        alert_type: 'unauthorized_exit',
        severity: 'critical',
        title: 'Exit Blocked - Invalid QR Code',
        description: 'Product Dell XPS 15 with invalid QR code detected at exit gate. Value: $1,299. Verification failed: signature mismatch. Employee ID: EMP-47821 flagged for investigation.',
        product_name: 'Dell XPS 15 Laptop',
        location: 'Exit Gate A',
        threat_score: 98.5,
        timestamp_detected: Date.now() - 120000,
        requires_action: true,
        value: 1299
      },
      {
        alert_id: 'ALERT-002',
        alert_type: 'inventory_discrepancy',
        severity: 'critical',
        title: 'Physical-Digital Mismatch',
        description: 'Weight sensors detect 45kg weight drop (30 items missing) but digital records show normal inventory. Matches sophisticated warehouse fraud attack patterns! Immediate lockdown initiated.',
        product_name: 'iPhone 15 Pro Max (x30)',
        location: 'Shelf-A-7, Zone 2',
        threat_score: 95.0,
        timestamp_detected: Date.now() - 300000,
        requires_action: true,
        value: 32970
      },
      {
        alert_id: 'ALERT-003',
        alert_type: 'suspicious_user',
        severity: 'critical',
        title: 'Fraudulent ERP Transaction Detected',
        description: 'User "warehouse_admin_78" created suspicious transaction marking 25 items as shipped without physical scan. Account credentials compromised. Access revoked automatically.',
        product_name: 'iPad Pro 12.9" (x25)',
        location: 'Warehouse B - Staging Area',
        threat_score: 92.7,
        timestamp_detected: Date.now() - 420000,
        requires_action: true,
        value: 27475
      },
      {
        alert_id: 'ALERT-004',
        alert_type: 'qr_verification_failed',
        severity: 'high',
        title: 'QR Signature Mismatch - Counterfeit Detected',
        description: 'Scanned QR code signature does not match trusted database. Cryptographic verification failed. Possible counterfeit product or cloned QR code. Item quarantined.',
        product_name: 'MacBook Pro 16" M3 Max',
        location: 'Receiving Dock 3',
        threat_score: 87.3,
        timestamp_detected: Date.now() - 540000,
        requires_action: true,
        value: 3499
      },
      {
        alert_id: 'ALERT-005',
        alert_type: 'weight_anomaly',
        severity: 'high',
        title: 'Weight Sensor Anomaly - Shelf Tampering',
        description: 'Shelf weight reduced by 12kg but no corresponding QR scans. Motion detected during off-peak hours. Camera footage flagged for review.',
        product_name: 'Samsung Galaxy S24 Ultra (x15)',
        location: 'Shelf-C-12, Zone 3',
        threat_score: 84.1,
        timestamp_detected: Date.now() - 720000,
        requires_action: true,
        value: 17985
      },
      {
        alert_id: 'ALERT-006',
        alert_type: 'sensor_anomaly',
        severity: 'medium',
        title: 'RFID Reader Malfunction - Potential Bypass',
        description: 'RFID reader in Zone 4 reported 0 scans for 45 minutes despite camera detecting movement. Possible jamming or sensor bypass attempt.',
        product_name: 'Multiple (Unknown)',
        location: 'Zone 4 - Electronics',
        threat_score: 72.1,
        timestamp_detected: Date.now() - 900000,
        requires_action: false,
        value: 0
      },
      {
        alert_id: 'ALERT-007',
        alert_type: 'access_violation',
        severity: 'medium',
        title: 'Unauthorized Zone Access',
        description: 'Employee badge EMP-29412 accessed restricted Zone 7 during non-authorized hours (2:47 AM). Badge access does not match shift schedule.',
        product_name: 'N/A',
        location: 'Zone 7 - High Value Storage',
        threat_score: 68.5,
        timestamp_detected: Date.now() - 1080000,
        requires_action: false,
        value: 0
      },
      {
        alert_id: 'ALERT-008',
        alert_type: 'qr_duplication',
        severity: 'high',
        title: 'Duplicate QR Code Scan Detected',
        description: 'Same QR code scanned twice within 5 minutes at different locations. Indicates possible QR code cloning or system manipulation.',
        product_name: 'Sony WH-1000XM5 Headphones',
        location: 'Exit Gate B & Shelf-D-3',
        threat_score: 81.9,
        timestamp_detected: Date.now() - 1260000,
        requires_action: true,
        value: 399
      },
      {
        alert_id: 'ALERT-009',
        alert_type: 'inventory_discrepancy',
        severity: 'medium',
        title: 'Inventory Count Mismatch',
        description: 'Physical count shows 47 units, digital system reports 52 units. Discrepancy of 5 units detected during routine audit.',
        product_name: 'Apple AirPods Pro (2nd Gen)',
        location: 'Shelf-B-9, Zone 1',
        threat_score: 64.2,
        timestamp_detected: Date.now() - 1440000,
        requires_action: false,
        value: 1245
      },
      {
        alert_id: 'ALERT-010',
        alert_type: 'suspicious_pattern',
        severity: 'low',
        title: 'Unusual Scan Pattern Detected',
        description: 'ML model detected unusual scanning velocity: 47 items scanned in 2 minutes by EMP-55198. Pattern deviates from normal behavior baseline.',
        product_name: 'Various Small Electronics',
        location: 'Packing Station 5',
        threat_score: 52.8,
        timestamp_detected: Date.now() - 1620000,
        requires_action: false,
        value: 0
      },
      {
        alert_id: 'ALERT-011',
        alert_type: 'camera_obstruction',
        severity: 'medium',
        title: 'Camera Feed Obstructed',
        description: 'Camera CAM-18 in Zone 2 view obstructed for 12 minutes. Last frame shows object blocking lens. Possible intentional tampering.',
        product_name: 'N/A',
        location: 'Zone 2 - Camera CAM-18',
        threat_score: 70.5,
        timestamp_detected: Date.now() - 1800000,
        requires_action: false,
        value: 0
      },
      {
        alert_id: 'ALERT-012',
        alert_type: 'unauthorized_exit',
        severity: 'high',
        title: 'Exit Without Proper Authorization',
        description: 'Individual attempted to exit with product lacking proper checkout QR scan. Security alert triggered. Item: High-value gaming laptop.',
        product_name: 'ASUS ROG Zephyrus G16',
        location: 'Exit Gate C',
        threat_score: 89.2,
        timestamp_detected: Date.now() - 2100000,
        requires_action: true,
        value: 2799
      },
      {
        alert_id: 'ALERT-013',
        alert_type: 'erp_anomaly',
        severity: 'medium',
        title: 'ERP System: Suspicious Return Entry',
        description: 'Return transaction created for items never marked as sold. Possible inventory manipulation or returns fraud scheme.',
        product_name: 'Google Pixel 8 Pro (x8)',
        location: 'Returns Processing',
        threat_score: 66.7,
        timestamp_detected: Date.now() - 2520000,
        requires_action: false,
        value: 7192
      },
      {
        alert_id: 'ALERT-014',
        alert_type: 'network_anomaly',
        severity: 'low',
        title: 'Network Traffic Spike',
        description: 'Unusual network traffic detected from warehouse terminal WT-45. Possible data exfiltration attempt or unauthorized access.',
        product_name: 'N/A',
        location: 'Terminal WT-45, Office Area',
        threat_score: 48.3,
        timestamp_detected: Date.now() - 3060000,
        requires_action: false,
        value: 0
      },
      {
        alert_id: 'ALERT-015',
        alert_type: 'motion_detection',
        severity: 'low',
        title: 'After-Hours Motion Detected',
        description: 'Motion sensors triggered in Zone 5 during closed hours (3:15 AM). No authorized personnel scheduled. Cameras show no clear visual.',
        product_name: 'N/A',
        location: 'Zone 5 - Storage',
        threat_score: 45.8,
        timestamp_detected: Date.now() - 3600000,
        requires_action: false,
        value: 0
      }
    ];

    setAlerts(mockAlerts);
    setMetrics({
      total_alerts: 47,
      critical_alerts: 8,
      threats_blocked: 23,
      avg_threat_score: 74.2,
      qr_scans_today: 15847,
      fraud_detected_today: 12,
      total_value_protected: 95464,
      response_time_ms: 87
    });
  }, []);

  // Threat trend data for charts
  const threatTrendData = [
    { time: '00:00', critical: 2, high: 5, medium: 8, low: 12 },
    { time: '04:00', critical: 1, high: 3, medium: 6, low: 9 },
    { time: '08:00', critical: 3, high: 7, medium: 10, low: 15 },
    { time: '12:00', critical: 5, high: 9, medium: 12, low: 18 },
    { time: '16:00', critical: 4, high: 8, medium: 11, low: 16 },
    { time: '20:00', critical: 3, high: 6, medium: 9, low: 13 },
  ];

  const scanActivityData = [
    { hour: '06:00', scans: 450, frauds: 2 },
    { hour: '08:00', scans: 1250, frauds: 3 },
    { hour: '10:00', scans: 2100, frauds: 5 },
    { hour: '12:00', scans: 2850, frauds: 4 },
    { hour: '14:00', scans: 3200, frauds: 6 },
    { hour: '16:00', scans: 2900, frauds: 3 },
    { hour: '18:00', scans: 1800, frauds: 2 },
  ];

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-critical',
      high: 'bg-high',
      medium: 'bg-medium',
      low: 'bg-low'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-600';
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter alerts by severity
  const filteredAlerts = filterSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div className="min-h-screen warehouse-bg">
      {/* Scanline overlay */}
      <div className="scanlines"></div>

      {/* Header */}
      <div className="relative z-10 glow-border-green bg-dark-warehouse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-display font-black neon-text-red">
                  BUSINESS GUARDIAN AI
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  Real-Time Warehouse Fraud Detection System v2.1.0
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-dark-warehouse border border-gray-700 rounded">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-neon-green pulse-green" />
                    <span className="text-neon-green font-mono text-xs">LIVE • {metrics.response_time_ms}ms</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500 font-mono text-xs">OFFLINE</span>
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-dark-warehouse border border-primary rounded">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-gray-300 font-mono text-xs">{user?.display_name}</span>
              </div>

              {/* Settings */}
              <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">
                <Settings className="h-6 w-6" />
              </Link>

              {/* Logout */}
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-1 border-b border-gray-700">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 font-display font-bold transition-all ${
                selectedTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>OVERVIEW</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`px-6 py-3 font-display font-bold transition-all ${
                selectedTab === 'alerts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>ALERTS ({alerts.length})</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 font-display font-bold transition-all ${
                selectedTab === 'analytics'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>ANALYTICS</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB */}
        {selectedTab === 'overview' && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-400">Total Alerts</p>
                    <p className="text-3xl font-display font-black text-white mt-2">{metrics.total_alerts}</p>
                    <p className="text-xs text-gray-500 font-body mt-1">Last 24 hours</p>
                  </div>
                  <AlertTriangle className="h-12 w-12 text-primary opacity-20" />
                </div>
              </div>

              <div className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-400">Critical Threats</p>
                    <p className="text-3xl font-display font-black text-critical mt-2">{metrics.critical_alerts}</p>
                    <p className="text-xs text-gray-500 font-body mt-1">Requires immediate action</p>
                  </div>
                  <Shield className="h-12 w-12 text-critical opacity-20" />
                </div>
              </div>

              <div className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-400">Threats Blocked</p>
                    <p className="text-3xl font-display font-black text-neon-green mt-2">{metrics.threats_blocked}</p>
                    <p className="text-xs text-gray-500 font-body mt-1">Attacks prevented today</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-neon-green opacity-20" />
                </div>
              </div>

              <div className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-400">Value Protected</p>
                    <p className="text-3xl font-display font-black text-neon-cyan mt-2">
                      {formatCurrency(metrics.total_value_protected)}
                    </p>
                    <p className="text-xs text-gray-500 font-body mt-1">Merchandise saved</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-neon-cyan opacity-20" />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card-hover mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-white">System Status</h2>
                <span className="text-xs font-mono text-neon-green">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Camera className="h-8 w-8 text-neon-green" />
                  <div>
                    <p className="font-body font-semibold text-white">Cameras</p>
                    <p className="text-sm text-neon-green font-mono">18 Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Weight className="h-8 w-8 text-neon-green" />
                  <div>
                    <p className="font-body font-semibold text-white">Weight Sensors</p>
                    <p className="text-sm text-neon-green font-mono">42 Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Cpu className="h-8 w-8 text-neon-green" />
                  <div>
                    <p className="font-body font-semibold text-white">RFID Readers</p>
                    <p className="text-sm text-neon-green font-mono">15 Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="h-8 w-8 text-neon-green" />
                  <div>
                    <p className="font-body font-semibold text-white">ML Model</p>
                    <p className="text-sm text-neon-green font-mono">Online (98.7%)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Threat Trend Chart */}
            <div className="card-hover mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">Threat Activity - Last 24 Hours</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={threatTrendData}>
                  <defs>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e4393c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e4393c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9500" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff9500" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #e4393c' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#e4393c" fill="url(#colorCritical)" name="Critical" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#ff9500" fill="url(#colorHigh)" name="High" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#ffd700" fill="#ffd70030" name="Medium" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#00ff88" fill="#00ff8830" name="Low" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Critical Alerts */}
            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-white">Critical Alerts Requiring Action</h2>
                <button
                  onClick={() => setSelectedTab('alerts')}
                  className="text-sm font-mono text-primary hover:text-red-400"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {alerts.filter(a => a.severity === 'critical').slice(0, 3).map((alert) => (
                  <div key={alert.alert_id} className="alert-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-400 font-mono">{formatTimestamp(alert.timestamp_detected)}</span>
                          {alert.value && (
                            <span className="text-sm text-neon-cyan font-mono">Value: {formatCurrency(alert.value)}</span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2 text-white">{alert.title}</h3>
                        <p className="text-sm text-gray-300 font-body mb-3">{alert.description}</p>
                        <div className="flex items-center flex-wrap gap-4 text-sm font-mono">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-300">{alert.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Threat:</span>
                            <span className="text-neon-orange font-bold ml-1">{alert.threat_score}/100</span>
                          </div>
                        </div>
                      </div>
                      {alert.requires_action && (
                        <button className="btn-primary ml-4 whitespace-nowrap">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ALERTS TAB */}
        {selectedTab === 'alerts' && (
          <>
            {/* Alert Filters */}
            <div className="card-hover mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-mono text-gray-400">Filter by Severity:</span>
                  <div className="flex space-x-2">
                    {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                      <button
                        key={severity}
                        onClick={() => setFilterSeverity(severity)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          filterSeverity === severity
                            ? 'bg-primary text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {severity.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-ghost flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* All Alerts */}
            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-white">
                  All Fraud Alerts ({filteredAlerts.length})
                </h2>
                <span className="text-xs font-mono text-gray-500">
                  Showing {filteredAlerts.length} of {alerts.length} alerts
                </span>
              </div>
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.alert_id} className="alert-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{alert.alert_id}</span>
                          <span className="text-sm text-gray-400 font-mono flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(alert.timestamp_detected)}</span>
                          </span>
                          {alert.value && alert.value > 0 && (
                            <span className="text-sm text-neon-cyan font-mono flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency(alert.value)}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2 text-white">{alert.title}</h3>
                        <p className="text-sm text-gray-300 font-body mb-3">{alert.description}</p>
                        <div className="flex items-center flex-wrap gap-4 text-sm font-mono">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-300">{alert.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Product:</span>
                            <span className="text-gray-300 ml-1">{alert.product_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Threat:</span>
                            <span className="text-neon-orange font-bold ml-1">{alert.threat_score}/100</span>
                          </div>
                        </div>
                      </div>
                      {alert.requires_action && (
                        <button className="btn-primary ml-4 whitespace-nowrap">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {selectedTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Scan Activity Chart */}
              <div className="card-hover">
                <h2 className="text-xl font-display font-bold text-white mb-4">QR Scan Activity</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scanActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00D4FF' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="scans" fill="#00D4FF" name="Total Scans" />
                    <Bar dataKey="frauds" fill="#e4393c" name="Fraud Detected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Threat Score Distribution */}
              <div className="card-hover">
                <h2 className="text-xl font-display font-bold text-white mb-4">Threat Score Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={threatTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00ff88' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="critical" stroke="#e4393c" strokeWidth={2} name="Critical" />
                    <Line type="monotone" dataKey="high" stroke="#ff9500" strokeWidth={2} name="High" />
                    <Line type="monotone" dataKey="medium" stroke="#ffd700" strokeWidth={2} name="Medium" />
                    <Line type="monotone" dataKey="low" stroke="#00ff88" strokeWidth={2} name="Low" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-hover">
                <h3 className="text-lg font-display font-bold text-white mb-3">QR Scan Performance</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Scans Today:</span>
                    <span className="text-white font-bold">{metrics.qr_scans_today.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fraud Detected:</span>
                    <span className="text-critical font-bold">{metrics.fraud_detected_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fraud Rate:</span>
                    <span className="text-neon-orange font-bold">
                      {((metrics.fraud_detected_today / metrics.qr_scans_today) * 100).toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response:</span>
                    <span className="text-neon-green font-bold">{metrics.response_time_ms}ms</span>
                  </div>
                </div>
              </div>

              <div className="card-hover">
                <h3 className="text-lg font-display font-bold text-white mb-3">Threat Intelligence</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Threat Score:</span>
                    <span className="text-white font-bold">{metrics.avg_threat_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Threats Blocked:</span>
                    <span className="text-neon-green font-bold">{metrics.threats_blocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Alerts:</span>
                    <span className="text-critical font-bold">{metrics.critical_alerts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Block Rate:</span>
                    <span className="text-neon-cyan font-bold">
                      {((metrics.threats_blocked / metrics.total_alerts) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-hover">
                <h3 className="text-lg font-display font-bold text-white mb-3">Value Protection</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Protected:</span>
                    <span className="text-neon-cyan font-bold">{formatCurrency(metrics.total_value_protected)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg per Alert:</span>
                    <span className="text-white font-bold">
                      {formatCurrency(Math.floor(metrics.total_value_protected / metrics.fraud_detected_today))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ML Accuracy:</span>
                    <span className="text-neon-green font-bold">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">False Positives:</span>
                    <span className="text-gray-300 font-bold">1.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

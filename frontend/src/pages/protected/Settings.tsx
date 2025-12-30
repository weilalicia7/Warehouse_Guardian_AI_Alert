/**
 * Settings Page - Full Production Demo
 * Complete settings with team management, API keys, notifications, security, and billing
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  User, Mail, Building, Shield, Key, Bell, CreditCard, Users,
  Copy, Check, Plus, Trash2, Edit, Download,
  Lock, AlertTriangle, CheckCircle, XCircle, Settings as SettingsIcon
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'account' | 'team' | 'api' | 'notifications' | 'security' | 'billing'>('account');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    weeklyReports: true,
    criticalOnly: false,
    slackIntegration: false
  });

  // Mock API keys
  const apiKeys = [
    {
      id: 'key_1',
      name: 'Production API Key',
      key: 'bg_prod_********************************',
      created: '2025-12-15',
      lastUsed: '2 hours ago',
      status: 'active'
    },
    {
      id: 'key_2',
      name: 'Development API Key',
      key: 'bg_test_********************************',
      created: '2025-11-28',
      lastUsed: '5 days ago',
      status: 'active'
    }
  ];

  // Mock team members
  const teamMembers = [
    {
      id: 'team_1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Admin',
      status: 'Active',
      joinedDate: '2025-01-15'
    },
    {
      id: 'team_2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Analyst',
      status: 'Active',
      joinedDate: '2025-02-03'
    },
    {
      id: 'team_3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Viewer',
      status: 'Active',
      joinedDate: '2025-03-10'
    }
  ];

  // Mock billing history
  const billingHistory = [
    {
      id: 'inv_001',
      date: '2025-12-01',
      amount: 99,
      status: 'Paid',
      invoice: 'INV-2025-12-001'
    },
    {
      id: 'inv_002',
      date: '2025-11-01',
      amount: 99,
      status: 'Paid',
      invoice: 'INV-2025-11-001'
    },
    {
      id: 'inv_003',
      date: '2025-10-01',
      amount: 99,
      status: 'Paid',
      invoice: 'INV-2025-10-001'
    }
  ];

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen warehouse-bg py-8 px-4">
      <div className="scanlines"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-display font-black neon-text-red">
              SETTINGS
            </h1>
          </div>
          <Link to="/dashboard" className="btn-ghost">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex space-x-1 border-b border-gray-700 overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'api', label: 'API Keys', icon: Key },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'billing', label: 'Billing', icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-6 py-3 font-display font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                selectedTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* ACCOUNT TAB */}
        {selectedTab === 'account' && (
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="card-hover">
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center space-x-2">
                <User className="h-6 w-6 text-primary" />
                <span>Account Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </label>
                  <div className="flex items-center justify-between bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <p className="text-white font-body text-lg">{user?.display_name}</p>
                    <button className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </label>
                  <div className="flex items-center justify-between bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <p className="text-white font-body text-lg">{user?.email}</p>
                    <CheckCircle className="h-4 w-4 text-neon-green" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4" />
                    <span>Company Name</span>
                  </label>
                  <div className="flex items-center justify-between bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <p className="text-white font-body text-lg">{user?.company_name}</p>
                    <button className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span>Subscription Plan</span>
                  </label>
                  <div className="flex items-center justify-between bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary text-white">
                      PROFESSIONAL
                    </span>
                    <span className="text-neon-cyan font-mono text-sm">$99/month</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <Lock className="h-4 w-4" />
                    <span>Authentication Method</span>
                  </label>
                  <div className="bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <p className="text-white font-body">
                      {user?.auth_provider === 'google' ? 'Google OAuth 2.0' : 'Email/Password + 2FA'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span>User ID</span>
                  </label>
                  <div className="bg-dark-bg border border-gray-700 rounded px-4 py-3">
                    <p className="text-gray-400 font-mono text-sm">{user?.user_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card-hover">
              <h3 className="text-lg font-display font-bold text-white mb-4">Account Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-ghost">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <button className="btn-ghost">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <button className="btn-ghost">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {selectedTab === 'team' && (
          <div className="space-y-6">
            <div className="card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center space-x-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span>Team Members ({teamMembers.length})</span>
                </h2>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Invite Team Member</span>
                </button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-dark-bg border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-body font-bold">{member.name}</p>
                        <p className="text-gray-400 font-mono text-sm">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-mono text-gray-400">Role</p>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                          member.role === 'Admin' ? 'bg-primary text-white' :
                          member.role === 'Analyst' ? 'bg-neon-cyan/20 text-neon-cyan' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-gray-400">Status</p>
                        <span className="flex items-center space-x-1 text-neon-green">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-sm font-mono">{member.status}</span>
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Settings */}
            <div className="card-hover">
              <h3 className="text-lg font-display font-bold text-white mb-4">Team Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                <div className="bg-dark-bg border border-gray-700 rounded p-4">
                  <p className="text-white font-bold mb-2">Admin</p>
                  <ul className="text-gray-400 space-y-1">
                    <li>✓ Full system access</li>
                    <li>✓ Manage team members</li>
                    <li>✓ View all alerts</li>
                    <li>✓ Export data</li>
                  </ul>
                </div>
                <div className="bg-dark-bg border border-gray-700 rounded p-4">
                  <p className="text-white font-bold mb-2">Analyst</p>
                  <ul className="text-gray-400 space-y-1">
                    <li>✓ View all alerts</li>
                    <li>✓ Create reports</li>
                    <li>✓ Take actions</li>
                    <li>✗ Manage team</li>
                  </ul>
                </div>
                <div className="bg-dark-bg border border-gray-700 rounded p-4">
                  <p className="text-white font-bold mb-2">Viewer</p>
                  <ul className="text-gray-400 space-y-1">
                    <li>✓ View dashboard</li>
                    <li>✓ View alerts</li>
                    <li>✗ Take actions</li>
                    <li>✗ Export data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API KEYS TAB */}
        {selectedTab === 'api' && (
          <div className="space-y-6">
            <div className="card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center space-x-2">
                  <Key className="h-6 w-6 text-primary" />
                  <span>API Keys</span>
                </h2>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Generate New Key</span>
                </button>
              </div>

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="bg-dark-bg border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-body font-bold">{apiKey.name}</p>
                        <p className="text-gray-400 font-mono text-xs">Created: {apiKey.created}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                          apiKey.status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {apiKey.status.toUpperCase()}
                        </span>
                        <button className="text-gray-400 hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-black border border-gray-800 rounded px-4 py-3 flex items-center justify-between">
                      <code className="text-neon-cyan font-mono text-sm">{apiKey.key}</code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="text-gray-400 hover:text-white ml-4"
                      >
                        {copiedKey === apiKey.id ? (
                          <Check className="h-4 w-4 text-neon-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-500 font-mono text-xs mt-2">Last used: {apiKey.lastUsed}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* API Documentation */}
            <div className="card-hover">
              <h3 className="text-lg font-display font-bold text-white mb-4">API Usage</h3>
              <div className="bg-dark-bg border border-gray-700 rounded p-4 font-mono text-sm space-y-2">
                <p className="text-gray-400">Base URL:</p>
                <code className="text-neon-cyan">https://api.businessguardian.ai/v1</code>
                <p className="text-gray-400 mt-4">Authentication:</p>
                <code className="text-gray-300">Authorization: Bearer YOUR_API_KEY</code>
                <p className="text-gray-400 mt-4">Example Request:</p>
                <pre className="text-neon-green bg-black p-3 rounded mt-2 overflow-x-auto">
{`curl -X GET "https://api.businessguardian.ai/v1/alerts" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {selectedTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card-hover">
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center space-x-2">
                <Bell className="h-6 w-6 text-primary" />
                <span>Notification Preferences</span>
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive fraud alerts via email' },
                  { key: 'pushAlerts', label: 'Real-Time Push Notifications', description: 'Instant browser notifications for critical threats' },
                  { key: 'weeklyReports', label: 'Weekly Summary Reports', description: 'Analytics and threat summary every Monday' },
                  { key: 'criticalOnly', label: 'Critical Alerts Only', description: 'Only notify for critical severity threats' },
                  { key: 'slackIntegration', label: 'Slack Integration', description: 'Send alerts to your Slack workspace' }
                ].map((setting) => (
                  <div key={setting.key} className="bg-dark-bg border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-body font-bold">{setting.label}</p>
                      <p className="text-gray-400 text-sm">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(setting.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[setting.key as keyof typeof notifications]
                          ? 'bg-primary'
                          : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[setting.key as keyof typeof notifications]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Channels */}
            <div className="card-hover">
              <h3 className="text-lg font-display font-bold text-white mb-4">Notification Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-bg border border-gray-700 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">Email</p>
                    <CheckCircle className="h-5 w-5 text-neon-green" />
                  </div>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <p className="text-neon-green text-xs font-mono mt-2">Connected</p>
                </div>
                <div className="bg-dark-bg border border-gray-700 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">Slack</p>
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm">Not connected</p>
                  <button className="text-primary text-xs font-mono mt-2 hover:text-red-400">
                    Connect Slack →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {selectedTab === 'security' && (
          <div className="space-y-6">
            <div className="card-hover">
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Security Settings</span>
              </h2>

              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="bg-dark-bg border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-body font-bold">Two-Factor Authentication (2FA)</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded text-xs font-bold bg-neon-green/20 text-neon-green flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>ENABLED</span>
                      </span>
                      <button className="btn-ghost">Configure</button>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-dark-bg border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-body font-bold">Password</p>
                      <p className="text-gray-400 text-sm">Last changed: 45 days ago</p>
                    </div>
                    <button className="btn-ghost">Change Password</button>
                  </div>
                </div>

                {/* Session Management */}
                <div className="bg-dark-bg border border-gray-700 rounded-lg p-4">
                  <div className="mb-4">
                    <p className="text-white font-body font-bold mb-1">Active Sessions</p>
                    <p className="text-gray-400 text-sm">Manage your active login sessions</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black border border-gray-800 rounded p-3">
                      <div>
                        <p className="text-white font-mono text-sm">Current Session</p>
                        <p className="text-gray-400 text-xs">Windows • Chrome • Cardiff, UK</p>
                      </div>
                      <span className="text-neon-green text-xs font-mono">Active Now</span>
                    </div>
                    <div className="flex items-center justify-between bg-black border border-gray-800 rounded p-3">
                      <div>
                        <p className="text-white font-mono text-sm">Mobile Device</p>
                        <p className="text-gray-400 text-xs">iPhone • Safari • London, UK</p>
                      </div>
                      <button className="text-error text-xs font-mono hover:text-red-400">Revoke</button>
                    </div>
                  </div>
                </div>

                {/* Security Log */}
                <div className="bg-dark-bg border border-gray-700 rounded-lg p-4">
                  <p className="text-white font-body font-bold mb-3">Recent Security Events</p>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Login successful</span>
                      <span className="text-xs">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>API key created</span>
                      <span className="text-xs">5 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Password changed</span>
                      <span className="text-xs">45 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {selectedTab === 'billing' && (
          <div className="space-y-6">
            <div className="card-hover">
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <span>Billing & Subscription</span>
              </h2>

              {/* Current Plan */}
              <div className="bg-dark-bg border border-primary rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-mono">Current Plan</p>
                    <p className="text-3xl font-display font-black text-white">Professional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-display font-black text-primary">$99</p>
                    <p className="text-gray-400 text-sm font-mono">per month</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">Next billing date: January 1, 2026</p>
                  <button className="btn-ghost">Manage Subscription</button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-dark-bg border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded bg-gradient-to-br from-primary to-neon-orange flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-body font-bold">Visa ending in 4242</p>
                      <p className="text-gray-400 text-sm">Expires 12/2027</p>
                    </div>
                  </div>
                  <button className="btn-ghost">Update</button>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-bold text-white">Billing History</h3>
                  <button className="btn-ghost flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download All</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="bg-dark-bg border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-2xl font-display font-black text-white">{new Date(invoice.date).getDate()}</p>
                          <p className="text-xs text-gray-400 font-mono">{new Date(invoice.date).toLocaleString('default', { month: 'short' })}</p>
                        </div>
                        <div>
                          <p className="text-white font-mono">{invoice.invoice}</p>
                          <p className="text-gray-400 text-sm">Professional Plan</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-bold">${invoice.amount}.00</p>
                          <span className="text-neon-green text-xs font-mono flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{invoice.status}</span>
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="border border-error rounded-lg p-8 bg-dark-warehouse">
          <h2 className="text-2xl font-display font-bold text-error mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6" />
            <span>Danger Zone</span>
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-body mb-1">Sign Out of Account</p>
              <p className="text-gray-400 text-sm">You will need to log in again to access your account</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-3 bg-error text-white font-bold rounded-lg hover:bg-red-600 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

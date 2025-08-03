'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Mail,
  Globe,
  UserCheck,
  Activity
} from 'lucide-react';
import { useToast, ToastProvider } from '@/components/ui/toast-system';

interface SecurityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}

function AdminSecurityPageContent() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showToast } = useToast();

  const securityLogs: SecurityLog[] = [
    {
      id: '1',
      action: 'Admin Login',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password Change',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed Login Attempt',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      ipAddress: '203.0.113.45',
      userAgent: 'Unknown',
      status: 'failed'
    },
    {
      id: '4',
      action: 'Client Data Export',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      status: 'warning'
    }
  ];

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: 'warning',
        message: 'Please fill in all password fields',
        style: 'modern'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        message: 'New passwords do not match',
        style: 'modern'
      });
      return;
    }

    if (newPassword.length < 8) {
      showToast({
        type: 'error',
        message: 'Password must be at least 8 characters long',
        style: 'modern'
      });
      return;
    }

    // Simulate password change
    showToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been changed successfully',
      style: 'modern'
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    showToast({
      type: twoFactorEnabled ? 'info' : 'success',
      title: `2FA ${twoFactorEnabled ? 'Disabled' : 'Enabled'}`,
      message: `Two-factor authentication has been ${twoFactorEnabled ? 'disabled' : 'enabled'}`,
      style: 'modern'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'warning': return Clock;
      default: return Activity;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security
          </h1>
          <p className="text-muted-foreground">
            Manage your account security and access controls
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  Configure your login and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <Label htmlFor="2fa">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleEnable2FA}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label htmlFor="email-alerts">Email Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified of suspicious activity
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-alerts"
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <div>
                      <Label htmlFor="login-alerts">Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert on new device logins
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="login-alerts"
                    checked={loginAlerts}
                    onCheckedChange={setLoginAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <div>
                      <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict access to trusted IPs only
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="ip-whitelist"
                    checked={ipWhitelist}
                    onCheckedChange={setIpWhitelist}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="5"
                    max="480"
                  />
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button onClick={handlePasswordChange} className="w-full">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Activity
                </CardTitle>
                <CardDescription>
                  Recent security events and login history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityLogs.map(log => {
                    const StatusIcon = getStatusIcon(log.status);
                    
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`p-1 rounded border ${getStatusColor(log.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{log.action}</h4>
                            <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatTimeAgo(log.timestamp)}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            <p>IP: {log.ipAddress}</p>
                            <p>Device: {log.userAgent}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">85%</span>
                    <Badge variant="secondary">Good</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password Strength</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Two-Factor Auth</span>
                      {twoFactorEnabled ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Recent Activity</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>IP Restrictions</span>
                      {ipWhitelist ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {!twoFactorEnabled && (
                        <p>• Enable two-factor authentication</p>
                      )}
                      <p>• Review login activity regularly</p>
                      <p>• Use strong, unique passwords</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminSecurityPage() {
  return (
    <ToastProvider position="top-right">
      <AdminSecurityPageContent />
    </ToastProvider>
  );
}

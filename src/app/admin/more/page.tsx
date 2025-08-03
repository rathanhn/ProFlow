'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCard,
  UserPlus,
  BarChart3,
  FileText,
  Download,
  Settings,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  User,
  Building,
  TrendingUp,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Badge } from '@/components/ui/badge';

interface MoreMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  color?: string;
  category: 'primary' | 'management' | 'tools' | 'settings';
}

export default function AdminMorePage() {
  const router = useRouter();
  const haptic = useHapticFeedback();

  const menuItems: MoreMenuItem[] = [
    // Primary Actions
    {
      id: 'transactions',
      title: 'Payments',
      description: 'View all transactions and payment history',
      icon: CreditCard,
      href: '/admin/transactions',
      color: 'text-green-600',
      category: 'primary'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Business insights and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-blue-600',
      category: 'primary'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and download detailed reports',
      icon: FileText,
      href: '/admin/reports',
      color: 'text-purple-600',
      category: 'primary'
    },

    // Management
    {
      id: 'team',
      title: 'Team',
      description: 'Manage team members and assignees',
      icon: UserPlus,
      href: '/admin/team',
      color: 'text-orange-600',
      category: 'management'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage alerts and notification settings',
      icon: Bell,
      href: '/admin/notifications',
      badge: 3,
      color: 'text-red-600',
      category: 'management'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'View deadlines and schedule overview',
      icon: Calendar,
      href: '/admin/calendar',
      color: 'text-indigo-600',
      category: 'management'
    },

    // Tools
    {
      id: 'export',
      title: 'Export Data',
      description: 'Export tasks, clients, and financial data',
      icon: Download,
      href: '/admin/export',
      color: 'text-teal-600',
      category: 'tools'
    },
    {
      id: 'backup',
      title: 'Backup',
      description: 'Data backup and restore options',
      icon: Database,
      href: '/admin/backup',
      color: 'text-cyan-600',
      category: 'tools'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with external tools and services',
      icon: Globe,
      href: '/admin/integrations',
      color: 'text-emerald-600',
      category: 'tools'
    },

    // Settings
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-600',
      category: 'settings'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security settings and access control',
      icon: Shield,
      href: '/admin/security',
      color: 'text-red-700',
      category: 'settings'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Documentation and support resources',
      icon: HelpCircle,
      href: '/admin/help',
      color: 'text-blue-700',
      category: 'settings'
    }
  ];

  const handleItemClick = (item: MoreMenuItem) => {
    haptic.androidClick();
    router.push(item.href);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'primary': return 'Quick Actions';
      case 'management': return 'Management';
      case 'tools': return 'Tools & Utilities';
      case 'settings': return 'Settings & Support';
      default: return '';
    }
  };

  const getCategoryItems = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  const categories = ['primary', 'management', 'tools', 'settings'];

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">More Options</h1>
          <p className="text-muted-foreground">
            Access additional features and settings for your admin dashboard
          </p>
        </div>

        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {getCategoryTitle(category)}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCategoryItems(category).map(item => {
                const Icon = item.icon;
                return (
                  <Card 
                    key={item.id} 
                    className="hover-lift cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-muted/50 ${item.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {item.title}
                            </h3>
                            {item.badge && item.badge > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Overview
            </CardTitle>
            <CardDescription>
              Key metrics and system status at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-muted-foreground">Clients</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">₹2.4L</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { RippleButton } from './ripple-effect';
import {
  Home,
  CheckSquare,
  Users,
  CreditCard,
  UserPlus,
  Settings,
  BarChart3,
  FileText,
  Download,
  LogOut,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

interface MobileTabsProps {
  className?: string;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const haptic = useHapticFeedback();

  // Determine user type based on current path
  const isAdminSection = pathname.startsWith('/admin');
  const isClientSection = pathname.startsWith('/client');
  const isCreatorSection = pathname.startsWith('/creator');

  // Get client ID from path for client sections
  const clientId = isClientSection ? pathname.split('/')[2] : null;

  // Define main navigation tabs for mobile based on user type
  const getMainTabs = (): TabItem[] => {
    if (isAdminSection) {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          href: '/admin',
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: CheckSquare,
          href: '/admin/tasks',
        },
        {
          id: 'clients',
          label: 'Clients',
          icon: Users,
          href: '/admin/clients',
        },
        {
          id: 'transactions',
          label: 'Payments',
          icon: CreditCard,
          href: '/admin/transactions',
        },
        {
          id: 'more',
          label: 'More',
          icon: Settings,
          href: '/admin/settings',
        },
      ];
    } else if (isClientSection && clientId) {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          href: `/client/${clientId}`,
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: CheckSquare,
          href: `/client/${clientId}/projects`,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: `/client/${clientId}/settings`,
        },
      ];
    } else if (isCreatorSection) {
      const creatorId = pathname.split('/')[2];
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          href: `/creator/${creatorId}`,
        },
        {
          id: 'tasks',
          label: 'My Tasks',
          icon: CheckSquare,
          href: `/creator/${creatorId}/tasks`,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: `/creator/settings`,
        },
      ];
    }

    // Default fallback (shouldn't happen)
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/admin',
      },
    ];
  };

  const mainTabs = getMainTabs();

  const handleTabPress = (tab: TabItem) => {
    haptic.androidClick();
    router.push(tab.href);
  };

  const isActiveTab = (href: string) => {
    // Handle exact matches for dashboard pages
    if (href === '/admin' || href.match(/^\/client\/[^\/]+$/) || href.match(/^\/creator\/[^\/]+$/)) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        'sticky-tabs safe-area-pb md:hidden', // Only show on mobile
        className
      )}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {mainTabs.map((tab) => {
          const isActive = isActiveTab(tab.href);
          const Icon = tab.icon;

          return (
            <RippleButton
              key={tab.id}
              variant="ghost"
              className={cn(
                'flex items-center justify-center p-3 min-w-0 flex-1 h-12 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              onClick={() => handleTabPress(tab)}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', isActive && 'text-primary')} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
            </RippleButton>
          );
        })}
      </div>
    </div>
  );
};

// More menu component for additional options
export const MobileMoreMenu: React.FC = () => {
  const router = useRouter();
  const haptic = useHapticFeedback();

  const moreItems: TabItem[] = [
    {
      id: 'team',
      label: 'Team',
      icon: UserPlus,
      href: '/admin/team',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      href: '/admin/reports',
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      href: '/admin/export',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  const handleItemPress = (item: TabItem) => {
    haptic.androidClick();
    router.push(item.href);
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {moreItems.map((item) => {
        const Icon = item.icon;
        return (
          <RippleButton
            key={item.id}
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-20 rounded-lg"
            onClick={() => handleItemPress(item)}
          >
            <Icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">{item.label}</span>
          </RippleButton>
        );
      })}
    </div>
  );
};

export default MobileTabs;

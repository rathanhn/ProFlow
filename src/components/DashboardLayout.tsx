'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  Rocket,
  Bell,
  Search,
  Plus,
  Moon,
  Sun,
  CreditCard,
  User,
  ListChecks,
  Banknote,
  FileDown,
  MessageSquare,
  HelpCircle,
  Home,
  BarChart3,
  Calendar,
  Shield,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Import notification service
import { getAdminNotifications } from '@/lib/firebase-service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Determine user role based on path
  const isAdminSection = pathname.startsWith('/admin');
  const isClientSection = pathname.startsWith('/client');
  const isCreatorSection = pathname.startsWith('/creator');

  // Extract ID from path if present
  const pathParts = pathname.split('/');
  const id = pathParts.length > 2 ? pathParts[2] : null;

  const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => (
    <div className="px-3 py-1">{children}</div>
  );

  const SidebarMenuButton = ({
    asChild,
    isActive,
    children,
    className
  }: {
    asChild?: boolean;
    isActive?: boolean;
    children: React.ReactNode;
    className?: string;
  }) => {
    const Comp = asChild ? React.Fragment : 'button';
    return (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
        isActive
          ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 font-medium shadow-sm border border-blue-100 dark:border-blue-900/30"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        className
      )}>
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full" />
        )}
        {children}
      </div>
    );
  };

  const Sidebar = ({ children }: { children: React.ReactNode }) => (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out glass-card border-r border-white/20 dark:border-white/10",
        isCollapsed ? "w-20" : "w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {children}
    </aside>
  );

  const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="h-16 flex items-center px-4 border-b border-white/10 dark:border-white/5">
      {children}
    </div>
  );

  const SidebarContent = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 overflow-y-auto py-4 custom-scrollbar no-scrollbar">
      {children}
    </div>
  );

  const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4 border-t border-white/10 dark:border-white/5 bg-white/5">
      {children}
    </div>
  );

  const SidebarMenu = ({ children }: { children: React.ReactNode }) => (
    <nav className="space-y-1">{children}</nav>
  );

  const UserProfile = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-blue-500/50 transition-all">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt={user?.email || ''} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">User</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Toggle Theme</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!isCollapsed && !compact && (
        <div className="flex flex-col overflow-hidden transition-all duration-300">
          <span className="text-sm font-medium truncate">My Account</span>
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
        </div>
      )}
    </div>
  );

  // Fetch notifications
  const [notifications, setNotifications] = useState<any[]>([]); // Using any to avoid strict type issues for now, matching fetched structure

  useEffect(() => {
    const loadNotifications = async () => {
      if (isAdminSection) {
        try {
          const data = await getAdminNotifications();
          setNotifications(data);
        } catch (e) {
          console.error("Failed to load notifications", e);
        }
      }
    };
    loadNotifications();
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAdminSection, pathname]);

  // Page Title Logic
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname === '/admin/tasks') return 'All Tasks';
    if (pathname === '/admin/clients') return 'Clients';
    if (pathname === '/admin/team') return 'Team';
    if (pathname === '/admin/transactions') return 'Transactions';
    if (pathname === '/admin/analytics') return 'Analytics';
    if (pathname === '/admin/reports') return 'Reports';
    if (pathname === '/admin/calendar') return 'Calendar';
    if (pathname === '/admin/settings') return 'Settings';
    if (pathname.includes('/new')) return 'Create New';
    if (pathname.includes('/edit')) return 'Edit';
    return 'ProFlow Panel';
  };

  const NotificationBell = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 rounded-full">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 glass-card z-[100]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No new notifications
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="font-medium text-sm">{n.message}</div>
                <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileTabs = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={toggleMobileMenu} />
    );
  };

  const renderContent = () => children;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ProFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserProfile compact />
        </div>
      </header>

      <Sidebar>
        <SidebarHeader>
          <div className={cn("flex items-center justify-between w-full transition-all duration-300", isCollapsed ? "justify-center" : "")}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">ProFlow</span>
              </div>
            )}
            {isCollapsed && (
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Rocket className="w-6 h-6 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex hover:bg-secondary/50 rounded-full"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {isAdminSection && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin">
                      <LayoutDashboard />
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/tasks')}>
                    <Link href="/admin/tasks">
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>All Tasks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/clients')}>
                    <Link href="/admin/clients">
                      <Users />
                      <span className={isCollapsed ? 'hidden' : ''}>Manage Clients</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/team')}>
                    <Link href="/admin/team">
                      <UserPlus />
                      <span className={isCollapsed ? 'hidden' : ''}>Creators</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/transactions')}>
                    <Link href="/admin/transactions">
                      <Banknote />
                      <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/analytics')}>
                    <Link href="/admin/analytics">
                      <BarChart3 />
                      <span className={isCollapsed ? 'hidden' : ''}>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reports')}>
                    <Link href="/admin/reports">
                      <FileText />
                      <span className={isCollapsed ? 'hidden' : ''}>Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/calendar')}>
                    <Link href="/admin/calendar">
                      <Calendar />
                      <span className={isCollapsed ? 'hidden' : ''}>Calendar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/notifications')}>
                    <Link href="/admin/notifications">
                      <Bell />
                      <span className={isCollapsed ? 'hidden' : ''}>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/export')}>
                    <Link href="/admin/export">
                      <FileDown />
                      <span className={isCollapsed ? 'hidden' : ''}>Export</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/security')}>
                    <Link href="/admin/security">
                      <Shield />
                      <span className={isCollapsed ? 'hidden' : ''}>Security</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/feedback')}>
                    <Link href="/admin/feedback">
                      <MessageSquare />
                      <span className={isCollapsed ? 'hidden' : ''}>Feedback & Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/help')}>
                    <Link href="/admin/help">
                      <HelpCircle />
                      <span className={isCollapsed ? 'hidden' : ''}>Help & Support</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                    <Link href="/admin/settings">
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {isClientSection && user && id && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `/client/${id}`}>
                    <Link href={`/client/${id}`}>
                      <Briefcase />
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/projects') || pathname.includes('/projects/')}>
                    <Link href={`/client/${id}/projects`}>
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>My Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/transactions`)}>
                    <Link href={`/client/${id}/transactions`}>
                      <Banknote />
                      <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/export`)}>
                    <Link href={`/client/${id}/export`}>
                      <FileDown />
                      <span className={isCollapsed ? 'hidden' : ''}>Export</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/settings`)}>
                    <Link href={`/client/${id}/settings`}>
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/feedback`)}>
                    <Link href={`/client/${id}/feedback`}>
                      <MessageSquare />
                      <span className={isCollapsed ? 'hidden' : ''}>Send Feedback</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {isCreatorSection && user && id && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `/creator/${id}`}>
                    <Link href={`/creator/${id}`}>
                      <Briefcase />
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/creator/${id}/tasks`)}>
                    <Link href={`/creator/${id}/tasks`}>
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>My Tasks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/creator/${id}/settings`)}>
                    <Link href={`/creator/${id}/settings`}>
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/creator/${id}/feedback`)}>
                    <Link href={`/creator/${id}/feedback`}>
                      <MessageSquare />
                      <span className={isCollapsed ? 'hidden' : ''}>Send Feedback</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>

      <div className={cn(
        "flex flex-col flex-1 w-full lg:pl-64 min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed && "lg:pl-20"
      )}>
        <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between px-6 glass-card border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 scrollable-content p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto pb-32 md:pb-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <MobileTabs />
    </div>
  );
};

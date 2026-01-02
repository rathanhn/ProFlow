'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  UserPlus,
  Maximize2,
  Minimize2,
  Trophy
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
import { usePersistedTheme } from '@/hooks/usePersistedTheme';
import OfflineBadge from '@/components/OfflineBadge';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Import notification service
import { getAdminNotifications, getClient, getAssignee } from '@/lib/firebase-service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import NotificationBellComponent from '@/components/NotificationBell';

interface UserProfileProps {
  user: any;
  profile: any;
  isAdminSection: boolean;
  isCreatorSection: boolean;
  isClientSection: boolean;
  isCollapsed: boolean;
  compact?: boolean;
  router: any;
  setTheme: (theme: string) => void;
  theme: string | undefined;
  handleSignOut: () => void;
  id: string | null;
}

const UserProfile = ({
  user, profile, isAdminSection, isCreatorSection, isClientSection,
  isCollapsed, compact, router, setTheme, theme, handleSignOut, id
}: UserProfileProps) => {
  if (!user) {
    return (
      <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-blue-500/50 transition-all bg-secondary/50"
          onClick={() => router.push(isAdminSection ? '/admin/login' : '/client-login')}
        >
          <User className="h-5 w-5" />
        </Button>
        {!isCollapsed && !compact && (
          <div className="flex flex-col overflow-hidden transition-all duration-300">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Guest Mode</span>
            <span className="text-[10px] uppercase font-black text-muted-foreground">Limited View</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")} onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-blue-500/50 transition-all active:scale-95 duration-200">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt={user?.email || ''} />
              <AvatarFallback>{(profile?.name || user?.email || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-0 overflow-hidden border-none bg-transparent shadow-none" align="end" forceMount>
          <div className="glass-card dark:bg-slate-900/95 border border-white/20 shadow-2xl rounded-2xl overflow-hidden mt-2">
            <div className="p-5 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl ring-2 ring-white/20 overflow-hidden shadow-lg shadow-blue-500/10 shrink-0">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile?.avatar || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt={user?.email || ''} />
                    <AvatarFallback className="bg-blue-600 text-white font-black">{(profile?.name || user?.email || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-black truncate tracking-tight uppercase leading-snug">
                    {profile?.name || 'Authorized User'}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 truncate leading-tight">
                    {user?.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full animate-pulse",
                      isAdminSection ? "bg-violet-500" : isCreatorSection ? "bg-emerald-500" : "bg-blue-500"
                    )}></div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isAdminSection ? "text-violet-500" : isCreatorSection ? "text-emerald-500" : "text-blue-500"
                    )}>
                      {isAdminSection ? 'Nexus Overseer' : isCreatorSection ? 'Lead Creator' : 'Elite Partner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <DropdownMenuLabel className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                Control Center
              </DropdownMenuLabel>

              <DropdownMenuItem className="h-10 px-3 rounded-lg focus:bg-blue-600/10 focus:text-blue-600 cursor-pointer font-bold" onClick={() => {
                if (isAdminSection) router.push('/admin/settings');
                else if (isClientSection && id) router.push(`/client/${id}/settings`);
                else if (isCreatorSection && id) router.push(`/creator/${id}/settings`);
              }}>
                <Settings className="mr-3 h-4 w-4 opacity-60" />
                <span className="text-xs">Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="h-10 px-3 rounded-lg focus:bg-primary/10 transition-colors cursor-pointer font-bold"
                onSelect={(e) => e.preventDefault()}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="mr-3 h-4 w-4 opacity-60" /> : <Moon className="mr-3 h-4 w-4 opacity-60" />}
                <span className="text-xs">{theme === 'dark' ? 'Daylight Mode' : 'Nightfall Mode'}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10 mx-2 my-2" />

              <DropdownMenuItem onClick={handleSignOut} className="h-10 px-3 rounded-lg text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer font-black transition-all">
                <LogOut className="mr-3 h-4 w-4 opacity-60" />
                <span className="text-xs uppercase tracking-widest">Terminate</span>
              </DropdownMenuItem>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {!isCollapsed && !compact && (
        <div className="flex flex-col overflow-hidden transition-all duration-300">
          <span className="text-sm font-bold truncate tracking-tight">{profile?.name || 'My Account'}</span>
          <span className="text-[10px] text-muted-foreground/60 truncate font-medium">{user?.email}</span>
        </div>
      )}
    </div>
  );
};

const NotificationBell = () => (
  <div onClick={(e) => e.stopPropagation()}>
    <NotificationBellComponent />
  </div>
);

const FullscreenToggle = ({ isFullscreen, toggleFullscreen }: { isFullscreen: boolean, toggleFullscreen: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => {
      e.stopPropagation();
      toggleFullscreen();
    }}
    className="hover:bg-secondary/50 rounded-full"
    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
  >
    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
  </Button>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = usePersistedTheme();
  const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string, avatar?: string } | null>(null);

  // Determine user role based on path
  const isAdminSection = pathname.startsWith('/admin');
  const isClientSection = pathname.startsWith('/client');
  const isCreatorSection = pathname.startsWith('/creator');

  // Extract ID from path if present
  const pathParts = pathname.split('/');
  const id = pathParts.length > 2 ? pathParts[2] : null;

  // Fetch real profile data from Firestore AND Enforce Access Control
  useEffect(() => {
    async function verifyAccessAndLoadProfile() {
      // 1. GUEST ACCESS for Client Section
      if (!user) {
        if (isClientSection && id) {
          try {
            const targetClient = await getClient(id);
            if (targetClient) setProfile({ name: targetClient.name, avatar: targetClient.avatar });
          } catch (e) {
            console.error("Guest profile load failed", e);
          }
        } else {
          setProfile(null);
        }
        return;
      }

      try {
        // Fetch user records from both collections
        const [clientData, creatorData] = await Promise.all([
          getClient(user.uid),
          getAssignee(user.uid)
        ]);

        const isUserCreator = !!creatorData;
        const isUserClient = !!clientData;
        const isUserAdmin = !isUserCreator && !isUserClient;

        // 2. Protection for Admin Portal
        if (isAdminSection && !isUserAdmin) {
          console.warn("Unauthorized admin portal access attempt.");
          if (isUserCreator) router.push(`/creator/${user.uid}`);
          else if (isUserClient) router.push(`/client/${user.uid}`);
          return;
        }

        // 3. Ownership check for logged-in non-admins
        // If logged in as client A, trying to view client B -> redirect to A
        // HOWEVER, if the user explicitly wants "view without login", we might allow it?
        // Let's keep the ownership check for now to prevent cross-account viewing WHILE logged in.
        if (!isUserAdmin) {
          if (isClientSection && id && id !== user.uid) {
            router.push(`/client/${user.uid}`);
            return;
          }
          if (isCreatorSection && id && id !== user.uid) {
            router.push(`/creator/${user.uid}`);
            return;
          }
        }

        // 4. Load Profile Information
        if (isAdminSection) {
          setProfile({ name: user.displayName || 'Admin', avatar: user.photoURL || '' });
        } else if (isClientSection && id) {
          const targetClient = id === user.uid ? clientData : await getClient(id);
          if (targetClient) setProfile({ name: targetClient.name, avatar: targetClient.avatar });
        } else if (isCreatorSection && id) {
          const targetCreator = id === user.uid ? creatorData : await getAssignee(id);
          if (targetCreator) setProfile({ name: targetCreator.name, avatar: targetCreator.avatar });
        }
      } catch (e) {
        console.error("Failed access verification or profile load", e);
      }
    }
    verifyAccessAndLoadProfile();
  }, [user, id, isAdminSection, isClientSection, isCreatorSection, pathname, router]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);


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

  // Page Title Logic
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname === '/admin/tasks') return 'All Tasks';
    if (pathname === '/admin/clients') return 'Partner Matrix';
    if (pathname === '/admin/team') return 'Creator Network';
    if (pathname.includes('/achievements')) return 'Achievement Center';
    if (pathname === '/admin/transactions') return 'Transactions';
    if (pathname === '/admin/analytics') return 'Analytics';
    if (pathname === '/admin/reports') return 'Reports';
    if (pathname === '/admin/calendar') return 'Calendar';
    if (pathname === '/admin/settings') return 'Settings';
    if (pathname.includes('/new')) return 'Create New';
    if (pathname.includes('/edit')) return 'Edit';
    return 'ProFlow Panel';
  };

  const TitleLabel = () => (
    <h1 className="premium-heading text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
      {getPageTitle()}
    </h1>
  );

  const MobileTabs = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={toggleMobileMenu} />
    );
  };


  return (
    <TooltipProvider delayDuration={300}>
      <OfflineBadge />
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
            <FullscreenToggle isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
            <NotificationBell />
            <UserProfile
              user={user}
              profile={profile}
              isAdminSection={isAdminSection}
              isCreatorSection={isCreatorSection}
              isClientSection={isClientSection}
              isCollapsed={false}
              compact={true}
              router={router}
              setTheme={setTheme}
              theme={theme}
              handleSignOut={handleSignOut}
              id={id}
            />
          </div>
        </header>

        <Sidebar>
          <SidebarHeader>
            <div className={cn("flex items-center w-full transition-all duration-300", isCollapsed ? "justify-center" : "gap-3")}>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">ProFlow</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex absolute -right-3 top-8 h-6 w-6 rounded-full border bg-background shadow-md z-50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-90"
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
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
                        <span className={isCollapsed ? 'hidden' : ''}>Partner Matrix</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/team')}>
                      <Link href="/admin/team">
                        <UserPlus />
                        <span className={isCollapsed ? 'hidden' : ''}>Creator Network</span>
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
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                      <Link href="/admin/settings">
                        <Settings />
                        <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {isClientSection && id && (
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
                  {user && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/transactions`)}>
                          <Link href={`/client/${id}/transactions`}>
                            <Banknote />
                            <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === `/client/${id}/achievements`}>
                          <Link href={`/client/${id}/achievements`}>
                            <Trophy />
                            <span className={isCollapsed ? 'hidden' : ''}>Achievements</span>
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
                    </>
                  )}
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
                    <SidebarMenuButton asChild isActive={pathname === `/creator/${id}/achievements`}>
                      <Link href={`/creator/${id}/achievements`}>
                        <Trophy />
                        <span className={isCollapsed ? 'hidden' : ''}>Achievements</span>
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
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className={cn("flex flex-col gap-1", isCollapsed ? "items-center" : "px-2")}>
              <p className={cn("text-[9px] font-black uppercase tracking-widest text-muted-foreground/30", isCollapsed && "hidden")}>Session Active</p>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500/20 to-transparent rounded-full" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className={cn(
          "flex flex-col flex-1 w-full lg:pl-64 min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed && "lg:pl-20"
        )}>
          <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between px-6 glass-card border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <TitleLabel />
            </div>
            <div className="flex items-center gap-4">
              <FullscreenToggle isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
              <NotificationBell />
              <UserProfile
                user={user}
                profile={profile}
                isAdminSection={isAdminSection}
                isCreatorSection={isCreatorSection}
                isClientSection={isClientSection}
                isCollapsed={false}
                compact={true}
                router={router}
                setTheme={setTheme}
                theme={theme}
                handleSignOut={handleSignOut}
                id={id}
              />
            </div>
          </header>

          <main className="flex-1 scrollable-content py-8 px-4 sm:py-10 sm:px-6 lg:py-12 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto pb-32 md:pb-16">
              {children}
            </div>
          </main>
        </div>

        <MobileTabs />
      </div>
      <ProfileImageViewer
        isOpen={isOpen}
        onClose={closeViewer}
        imageUrl={imageData.imageUrl}
        userName={imageData.userName}
        userEmail={imageData.userEmail}
      />
    </TooltipProvider>
  );
};

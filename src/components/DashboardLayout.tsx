'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Users, Briefcase, LogOut, Rocket } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { clients } from '@/lib/data';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firstClientId = clients[0]?.id || '1';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Rocket className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold">ProFlow</h1>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin">
                    <Home />
                    Admin Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/clients')}>
                  <Link href="/admin/clients">
                    <Users />
                    Manage Clients
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/client')}>
                  <Link href={`/client/${firstClientId}`}>
                    <Briefcase />
                    Client Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="@admin" data-ai-hint="user avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@proflow.app</p>
              </div>
               <Link href="/">
                <Button variant="ghost" size="icon">
                    <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b h-16">
            <SidebarTrigger />
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

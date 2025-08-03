
'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    PlusCircle,
    Mail,
    Edit,
    Trash2,
    Eye,
    Plus,
    UserPlus,
    Phone,
    DollarSign
} from 'lucide-react';
import { getClients, deleteClient } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import React, { useState, useEffect } from 'react';
import ClientActions from './ClientActions';
import { SwipeActionItem, SwipeAction } from '@/components/ui/swipe-action';
import { LongPressMenu } from '@/components/ui/long-press';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useRouter } from 'next/navigation';


export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const haptic = useHapticFeedback();
    const router = useRouter();
    const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

    const loadClients = async () => {
        try {
            const rawClients = await getClients();
            setClients(JSON.parse(JSON.stringify(rawClients)) as Client[]);
        } catch (error) {
            console.error('Failed to load clients:', error);
            haptic.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleRefresh = async () => {
        haptic.androidSwipeRefresh();
        await loadClients();
    };

    const handleDeleteClient = async (clientId: string) => {
        try {
            haptic.androidClick();
            await deleteClient(clientId);
            setClients(prev => prev.filter(client => client.id !== clientId));
            haptic.success();
        } catch (error) {
            console.error('Failed to delete client:', error);
            haptic.error();
        }
    };

    const getSwipeActions = (client: Client): SwipeAction[] => [
        {
            id: 'view',
            label: 'View',
            icon: Eye,
            color: 'primary',
            onAction: () => {
                router.push(`/admin/clients/${client.id}`);
            },
        },
        {
            id: 'edit',
            label: 'Edit',
            icon: Edit,
            color: 'secondary',
            onAction: () => {
                router.push(`/admin/clients/${client.id}/edit`);
            },
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: Trash2,
            color: 'destructive',
            onAction: () => {
                if (confirm('Are you sure you want to delete this client?')) {
                    handleDeleteClient(client.id);
                }
            },
        },
    ];

    const getLongPressActions = (client: Client) => [
        {
            id: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => router.push(`/admin/clients/${client.id}`),
        },
        {
            id: 'edit',
            label: 'Edit Client',
            icon: Edit,
            onClick: () => router.push(`/admin/clients/${client.id}/edit`),
        },
        {
            id: 'delete',
            label: 'Delete Client',
            icon: Trash2,
            onClick: () => {
                if (confirm('Are you sure you want to delete this client?')) {
                    handleDeleteClient(client.id);
                }
            },
            variant: 'destructive' as const,
        },
    ];

    const fabActions = [
        {
            id: 'new-client',
            label: 'New Client',
            icon: UserPlus,
            onClick: () => {
                haptic.androidClick();
                router.push('/admin/clients/new');
            },
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6 fab-safe-bottom">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                  <p className="text-muted-foreground">Add, edit, or remove clients.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <RippleButton
                    className="w-full sm:w-auto"
                    onClick={() => {
                      haptic.androidClick();
                      router.push('/admin/clients/new');
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Client
                  </RippleButton>
              </div>
          </div>
       
          <Card className="md:hidden">
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>Manage your clients and their dashboard access.</CardDescription>
            </CardHeader>
          </Card>

          {/* Mobile View with Swipe Actions */}
          <div className="grid gap-4 md:hidden">
              {clients.map((client: Client) => (
                  <SwipeActionItem
                      key={client.id}
                      rightActions={getSwipeActions(client)}
                      className="rounded-lg"
                  >
                      <LongPressMenu actions={getLongPressActions(client)}>
                          <Card
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => {
                                  haptic.androidClick();
                                  router.push(`/admin/clients/${client.id}`);
                              }}
                          >
                              <CardHeader>
                                  <div className="flex items-center gap-4">
                                      <Avatar
                                          className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              const imageUrl = client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
                                              openViewer(imageUrl, client.name, client.email);
                                          }}
                                      >
                                          <AvatarImage src={client.avatar} alt="Avatar" />
                                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                          <CardTitle className="text-base">{client.name}</CardTitle>
                                          <CardDescription className="flex items-center gap-2 pt-1">
                                              <Mail className="h-3 w-3" />
                                              {client.email}
                                          </CardDescription>
                                          <div className="flex items-center gap-2 pt-1">
                                              <Phone className="h-3 w-3" />
                                              <span className="text-sm text-muted-foreground">
                                                  {client.phone || 'No phone'}
                                              </span>
                                          </div>
                                          {client.defaultRate && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="text-sm text-muted-foreground">
                                                    ₹{client.defaultRate}/page
                                                </span>
                                            </div>
                                          )}
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <ClientActions client={client} action="copy" />
                              </CardContent>
                          </Card>
                      </LongPressMenu>
                  </SwipeActionItem>
              ))}
          </div>

        {/* Desktop View */}
        <div className="hidden md:block w-full">
            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>Manage your clients and their dashboard access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Default Rate</TableHead>
                        <TableHead>Sharable Link</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client: Client) => (
                        <TableRow
                            key={client.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => {
                                haptic.androidClick();
                                router.push(`/admin/clients/${client.id}`);
                            }}
                        >
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar
                                    className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const imageUrl = client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
                                        openViewer(imageUrl, client.name, client.email);
                                    }}
                                >
                                <AvatarImage src={client.avatar} alt="Avatar" />
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium whitespace-nowrap">{client.name}</p>
                            </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{client.email}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {client.defaultRate ? `₹${client.defaultRate}/page` : 'Not set'}
                            </TableCell>
                            <TableCell>
                            <ClientActions client={client} action="copy" />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/clients/${client.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/clients/${client.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Client
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <ClientActions client={client} action="delete" />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />

      {/* Profile Image Viewer */}
      <ProfileImageViewer
        isOpen={isOpen}
        onClose={closeViewer}
        imageUrl={imageData.imageUrl}
        userName={imageData.userName}
        userEmail={imageData.userEmail}
      />
    </DashboardLayout>
  );
}

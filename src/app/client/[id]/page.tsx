
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ListChecks,
    ArrowRight,
    FileText,
    Settings,
    CreditCard
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { Button } from '@/components/ui/button';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';

export default function ClientDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const [clientId, setClientId] = useState<string>('');
  const [client, setClient] = useState<Client | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setClientId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  const loadData = async () => {
    if (!clientId) return;

    try {
      const rawClient = await getClient(clientId);
      if (!rawClient) {
        notFound();
        return;
      }

      const rawClientTasks = await getTasksByClientId(clientId);

      setClient(JSON.parse(JSON.stringify(rawClient)) as Client);
      setClientTasks(JSON.parse(JSON.stringify(rawClientTasks)) as Task[]);
    } catch (error) {
      console.error('Failed to load data:', error);
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const handleRefresh = async () => {
    haptic.androidSwipeRefresh();
    await loadData();
  };

  if (isLoading || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpent = clientTasks.reduce((acc, task) => acc + (task.amountPaid || 0), 0);
  const outstandingBalance = clientTasks.reduce((acc, task) => acc + ((task.total || 0) - (task.amountPaid || 0)), 0);
  const projectsInProgress = clientTasks.filter(t => t.workStatus === 'In Progress').length;

  const fabActions = [
    {
      id: 'projects',
      label: 'View Projects',
      icon: ListChecks,
      onClick: () => {
        haptic.androidClick();
        router.push(`/client/${clientId}/projects`);
      },
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      onClick: () => {
        haptic.androidClick();
        router.push(`/client/${clientId}/transactions`);
      },
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: FileText,
      onClick: () => {
        haptic.androidClick();
        router.push(`/client/${clientId}/export`);
      },
    },
  ];

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6 fab-safe-bottom">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <ClickableAvatar
                  src={client.avatar}
                  fallback={client.name.charAt(0)}
                  userName={client.name}
                  userEmail={client.email}
                  size="xl"
                  className="border-2 border-primary flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                      <div>
                          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{client.name}</h1>
                          <p className="text-muted-foreground text-sm sm:text-base">Welcome to your personal dashboard.</p>
                      </div>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                              haptic.androidClick();
                              router.push(`/client/${client.id}/settings`);
                          }}
                          className="flex-shrink-0"
                      >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                      </Button>
                  </div>
              </div>
          </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <INRIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total amount paid for all projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <INRIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{outstandingBalance.toLocaleString()}</div>
               <p className="text-xs text-muted-foreground">Across all unpaid/partial projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects in Progress</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsInProgress}</div>
              <p className="text-xs text-muted-foreground">{clientTasks.length} total projects with us</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>A brief look at your most recent projects.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {clientTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{task.projectName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.workStatus}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              ₹{task.amountPaid.toLocaleString()} / ₹{task.total.toLocaleString()}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                            <Link href={`/client/${client.id}/projects/${task.id}`}>
                                View Details
                            </Link>
                        </Button>
                    </div>
                ))}
                {clientTasks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No projects yet.</p>
                  </div>
                )}
            </div>
             <div className="mt-4 pt-4 border-t">
                <RippleButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    haptic.androidClick();
                    router.push(`/client/${client.id}/projects`);
                  }}
                >
                  View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </RippleButton>
            </div>
          </CardContent>
        </Card>
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />
    </DashboardLayout>
  );
}

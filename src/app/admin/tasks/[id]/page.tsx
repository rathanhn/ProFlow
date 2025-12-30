import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTask, getClient } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Layout, ShieldCheck, Mail, Sparkles, User } from 'lucide-react';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { Task, Client } from '@/lib/types';
import AdminActions from './AdminActions';
import TaskDetails from '@/components/TaskDetails';
import { validateRouteId, sanitizeRouteParam } from '@/lib/auth-utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;

  if (!validateRouteId(rawId)) {
    notFound();
  }

  const id = sanitizeRouteParam(rawId);

  try {
    const rawTask = await getTask(id);
    if (!rawTask) {
      notFound();
    }

    const task = JSON.parse(JSON.stringify(rawTask)) as Task;
    const rawClient = await getClient(task.clientId);
    const client = rawClient ? (JSON.parse(JSON.stringify(rawClient)) as Client) : null;

    return (
      <DashboardLayout>
        <div className="space-y-8 fab-safe-bottom w-full">
          {/* Navigation & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="rounded-2xl bg-secondary/50 hover:bg-secondary">
                <Link href="/admin/tasks">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-blue-500/20 text-blue-600 bg-blue-500/5">
                    Operational Intelligence
                  </Badge>
                  <div className="h-1 w-1 rounded-full bg-border"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {task.projectNo || 'Global Project'}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter">{task.projectName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500 hover:bg-blue-600 border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg shadow-blue-500/10">
                {task.workStatus}
              </Badge>
              <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
                <Link href={`/admin/tasks/${task.id}/edit?redirect=/admin/tasks/${task.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-gradient-to-br from-blue-500/5 to-transparent border-b border-border/10 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                      <Layout className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight">Project Matrix</CardTitle>
                      <CardDescription className="text-sm font-medium">Core technical specifications and client requirements.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-10">
                  <TaskDetails task={task} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <AdminActions task={task} />

              {client && (
                <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <ShieldCheck className="h-6 w-6 text-amber-600" />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight">Client Hub</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                      <ClickableAvatar
                        src={client.avatar}
                        fallback={client.name.charAt(0)}
                        userName={client.name}
                        userEmail={client.email}
                        size="lg"
                        className="ring-4 ring-white shadow-2xl"
                      />
                      <div className="min-w-0">
                        <p className="font-black text-sm uppercase tracking-tight truncate">{client.name}</p>
                        <div className="flex items-center gap-2 mt-1 opacity-60">
                          <Mail className="h-3.5 w-3.5" />
                          <p className="text-[10px] font-bold truncate">{client.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-blue-500/10 shadow-sm rounded-[2.5rem] bg-blue-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-24 w-24 text-blue-500" />
                </div>
                <CardContent className="pt-8">
                  <div className="flex items-center gap-3 text-blue-700">
                    <Sparkles className="h-5 w-5" />
                    <p className="text-sm font-black uppercase tracking-widest">Administrator Note</p>
                  </div>
                  <p className="text-xs text-blue-600/80 mt-3 leading-relaxed font-medium">
                    Ensuring precise status updates and transparent communication is vital for maintaining project velocity and client trust.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error(`Error loading task details:`, error);
    notFound();
  }
}

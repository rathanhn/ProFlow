import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import ClientTaskList from '@/components/ClientTaskList';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Sparkles, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawClient = await getClient(id);

  if (!rawClient) {
    notFound();
  }

  const client = JSON.parse(JSON.stringify(rawClient)) as Client;
  const rawClientTasks = await getTasksByClientId(id);
  const clientTasks = JSON.parse(JSON.stringify(rawClientTasks)) as Task[];

  const inProgressCount = clientTasks.filter(t => t.workStatus === 'In Progress').length;
  const completedCount = clientTasks.filter(t => t.workStatus === 'Completed').length;
  const pendingCount = clientTasks.filter(t => t.workStatus === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom w-full">
        {/* Premium Client Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -m-8 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-80 w-80 rounded-full bg-black/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-3 py-1 h-6 rounded-full">
                  Portfolio
                </Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
                <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                  Active Investment Tracker
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight flex items-center gap-4">
                <Briefcase className="h-12 w-12 text-indigo-300" /> Your Projects
              </h1>
              <p className="text-indigo-50/70 max-w-2xl text-base md:text-lg font-medium italic border-l-4 border-indigo-400/30 pl-6">
                Monitor the real-time evolution of your creative assets. Track delivery milestones, review production drafts, and maintain full transparency into your project lifecycle.
              </p>
            </div>

            <div className="flex gap-4 md:gap-6">
              <div className="px-8 py-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center min-w-[120px]">
                <Clock className="h-6 w-6 text-indigo-300 mb-2" />
                <span className="text-3xl font-black tabular-nums">{inProgressCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-center">In Production</span>
              </div>
              <div className="px-8 py-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center min-w-[120px]">
                <CheckCircle2 className="h-6 w-6 text-indigo-300 mb-2" />
                <span className="text-3xl font-black tabular-nums">{completedCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-center">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md p-2">
          <ClientTaskList
            tasks={clientTasks}
            clientId={client.id}
            title="Project Roadmap"
            emptyStateMessage="Your Roadmap is Clear"
            emptyStateDescription="You don't have any active projects at the moment. When we start a new collaboration, your projects will manifest here."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

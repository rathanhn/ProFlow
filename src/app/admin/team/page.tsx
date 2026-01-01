import DashboardLayout from '@/components/DashboardLayout';
import { getAssignees, getTasks } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import React from 'react';
import AddTeamMemberForm from './AddTeamMemberForm';
import TeamPageClient from './TeamPageClient';
import { Users, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/charts';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const [rawAssignees, rawTasks] = await Promise.all([
    getAssignees(),
    getTasks()
  ]);

  // Ensure data is serializable
  const assignees = JSON.parse(JSON.stringify(rawAssignees)) as Assignee[];
  const tasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];

  const activeTasks = tasks.filter(t => t.workStatus !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.workStatus === 'Completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom pt-4">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
            <div className="space-y-3 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-blue-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                      Human Capital
                    </span>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[8px] md:text-[10px] uppercase font-bold px-2 py-0 h-4 md:h-5">
                      Net
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                    Creative Leads
                  </h1>
                </div>
              </div>
              <p className="hidden sm:block opacity-70 text-sm leading-relaxed border-l-2 border-white/20 pl-4 py-1 max-w-xl italic">
                Orchestrating a global network of elite creators and creative professionals.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <AddTeamMemberForm />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Creators"
            value={assignees.length}
            icon={<ShieldCheck className="h-6 w-6 text-blue-500" />}
            className="glass-card border-blue-500/20 shadow-blue-500/5"
          />
          <MetricCard
            title="Active Missions"
            value={activeTasks}
            icon={<Zap className="h-6 w-6 text-amber-500" />}
            className="glass-card border-amber-500/20 shadow-amber-500/5"
          />
          <MetricCard
            title="Successful Cycles"
            value={completedTasks}
            icon={<Sparkles className="h-6 w-6 text-emerald-500" />}
            className="glass-card border-emerald-500/20 shadow-emerald-500/5"
          />
          <MetricCard
            title="Network Velocity"
            value={`${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`}
            icon={<Users className="h-6 w-6 text-violet-500" />}
            className="glass-card border-violet-500/20 shadow-violet-500/5"
          />
        </div>

        <TeamPageClient initialAssignees={assignees} />
      </div>
    </DashboardLayout>
  );
}

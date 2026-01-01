import DashboardLayout from '@/components/DashboardLayout';
import { getTasks, getClients, getAssignees } from '@/lib/firebase-service';
import TaskList from '@/components/TaskList';
import { Client, Task, Assignee } from '@/lib/types';
import ExportDialog from '@/components/ExportDialog';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const [rawTasks, rawClients, rawAssignees] = await Promise.all([
    getTasks(),
    getClients(),
    getAssignees()
  ]);

  // Serialize data
  const tasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
  const clients = JSON.parse(JSON.stringify(rawClients)) as Client[];
  const assignees = JSON.parse(JSON.stringify(rawAssignees)) as Assignee[];

  const inProgressCount = tasks.filter(t => t.workStatus === 'In Progress').length;
  const completedCount = tasks.filter(t => t.workStatus === 'Completed').length;
  const pendingCount = tasks.filter(t => t.workStatus === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom w-full">
        {/* Premium Page Header */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -m-8 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-80 w-80 rounded-full bg-black/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-8">
            <div className="space-y-3 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[8px] md:text-[10px] uppercase font-bold px-2 py-0.5 h-5 rounded-full">
                  Operations Center
                </Badge>
                <div className="h-1 w-1 rounded-full bg-white/40"></div>
                <span className="text-white/70 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  Management
                </span>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight flex items-center gap-2 md:gap-4">
                <LayoutGrid className="h-6 w-6 md:h-12 md:w-12 text-blue-300" /> Task Control
              </h1>
              <p className="hidden sm:block text-blue-50/70 max-w-2xl text-base lg:text-lg font-medium italic border-l-4 border-blue-400/30 pl-6 leading-relaxed">
                Seamlessly orchestrate your entire project ecosystem. Monitor production velocity, manage creator assignments, and ensure top-tier delivery standards across every client account.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-6">
              <div className="p-2 md:px-8 md:py-6 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-[2.5rem] border border-white/10 shadow-lg flex flex-col items-center min-w-[70px] md:min-w-[140px] hover:scale-105 transition-transform">
                <Clock className="h-3 w-3 md:h-6 md:w-6 text-blue-300 mb-1 md:mb-2" />
                <span className="text-lg md:text-3xl font-black tabular-nums">{inProgressCount}</span>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Active</span>
              </div>
              <div className="p-2 md:px-8 md:py-6 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-[2.5rem] border border-white/10 shadow-lg flex flex-col items-center min-w-[70px] md:min-w-[140px] hover:scale-105 transition-transform">
                <CheckCircle2 className="h-3 w-3 md:h-6 md:w-6 text-emerald-300 mb-1 md:mb-2" />
                <span className="text-lg md:text-3xl font-black tabular-nums">{completedCount}</span>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Success</span>
              </div>
              <div className="p-2 md:px-8 md:py-6 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-[2.5rem] border border-white/10 shadow-lg flex flex-col items-center min-w-[70px] md:min-w-[140px] hover:scale-105 transition-transform">
                <ClipboardList className="h-3 w-3 md:h-6 md:w-6 text-amber-300 mb-1 md:mb-2" />
                <span className="text-lg md:text-3xl font-black tabular-nums">{pendingCount}</span>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Backlog</span>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-12 flex justify-end relative z-10">
            <ExportDialog
              baseUrl="/admin/tasks/report"
              assignees={assignees}
              title="Generate Intelligence Report"
            />
          </div>
        </div>

        <div className="glass-card rounded-[3rem] border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md p-2">
          <TaskList
            tasks={tasks}
            title="Operational Pipeline"
            showClient={true}
            showAddButton={true}
            addButtonLink="/admin/tasks/new?redirect=/admin/tasks"
            emptyStateMessage="No Initiatives Found"
            emptyStateDescription="Your command center is clear. Begin by architecting a new project or assigning creative briefs to your team."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  FileText,
  DollarSign,
  User,
  Eye,
  Edit,
  ExternalLink,
  Clock,
  Trash2,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Imports
import { updateTask, getClient } from '@/lib/firebase-service';
import { useRouter, usePathname } from 'next/navigation';
import { PaymentTerms } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  showClient?: boolean;
  onDelete?: (taskId: string) => void;
  onUpdate?: () => void;
}

export default function TaskCard({ task, showClient = false, onDelete, onUpdate }: TaskCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [localTask, setLocalTask] = React.useState(task);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (submissionDate: string) => {
    const today = new Date();
    const deadline = new Date(submissionDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Partially Paid': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Unpaid': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleMarkCompleted = async () => {
    if (localTask.workStatus === 'Completed') return;
    setIsUpdating(true);
    try {
      const client = await getClient(task.clientId);
      let paymentDueDate = new Date().toISOString();

      if (client?.paymentTerms) {
        const d = new Date();
        switch (client.paymentTerms) {
          case 'Net 15': d.setDate(d.getDate() + 15); break;
          case 'Net 30': d.setDate(d.getDate() + 30); break;
          case 'Due End of Month':
            // Set to last day of current month
            d.setMonth(d.getMonth() + 1);
            d.setDate(0);
            break;
          case 'Due on Receipt': break; // Today
          case 'Net 5':
          default: d.setDate(d.getDate() + 5); break;
        }
        paymentDueDate = d.toISOString();
      } else {
        // Default to Net 5 if not set
        const d = new Date();
        d.setDate(d.getDate() + 5);
        paymentDueDate = d.toISOString();
      }

      await updateTask(task.id, {
        workStatus: 'Completed',
        paymentDueDate
      });

      // Celebration!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6']
      });

      setLocalTask(prev => ({
        ...prev,
        workStatus: 'Completed',
        paymentDueDate
      }));
      router.refresh();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentReceived = async () => {
    if (localTask.paymentStatus === 'Paid') return;
    setIsUpdating(true);
    try {
      await updateTask(task.id, {
        paymentStatus: 'Paid',
        amountPaid: localTask.total // Set amountPaid to total
      });

      // Financial Celebration!
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#ffffff']
      });

      setLocalTask(prev => ({
        ...prev,
        paymentStatus: 'Paid',
        amountPaid: localTask.total
      }));
      router.refresh();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const daysRemaining = getDaysRemaining(localTask.submissionDate);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <TooltipProvider>
      <div className="glass-card rounded-[2rem] p-8 hover-lift relative group transition-all duration-500 border-white/20 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent backdrop-blur-xl">
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/5 blur-[80px] rounded-full transition-all duration-1000 group-hover:bg-primary/10 group-hover:scale-125"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-purple-500/5 blur-[80px] rounded-full transition-all duration-1000 group-hover:bg-purple-500/10 group-hover:scale-125 delay-150"></div>

        <div className="relative z-10 flex flex-col gap-8">
          {/* Header Row: Project ID, Client, and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {localTask.projectNo && (
                <span className="text-[10px] font-black tracking-[0.2em] uppercase py-1.5 px-3 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                  {localTask.projectNo}
                </span>
              )}
              <div className="h-4 w-[1px] bg-border/50 mx-1"></div>
              <div className="flex items-center gap-2 text-muted-foreground group/client">
                <User className="h-4 w-4 text-primary/60" />
                <span className="text-sm font-bold tracking-tight group-hover/client:text-primary transition-colors">{localTask.clientName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" asChild className="h-10 w-10 rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 hover:bg-primary hover:text-white transition-all duration-300">
                    <Link href={`/admin/tasks/${localTask.id}`}>
                      <Eye className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">View Workspace</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-10 w-10 rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 hover:bg-secondary transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card rounded-2xl border-white/20 p-2 min-w-[180px]">
                  <DropdownMenuItem onClick={handleMarkCompleted} disabled={isUpdating} className="rounded-xl py-2.5">
                    <CheckSquare className="mr-3 h-4 w-4 text-emerald-500" /> <span className="font-bold">Mark Completed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePaymentReceived} disabled={isUpdating} className="rounded-xl py-2.5">
                    <DollarSign className="mr-3 h-4 w-4 text-blue-500" /> <span className="font-bold">Mark Fully Paid</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl py-2.5">
                    <Link href={`/admin/tasks/${localTask.id}/edit?redirect=${encodeURIComponent(pathname)}`}>
                      <Edit className="mr-3 h-4 w-4 text-amber-500" /> <span className="font-bold">Modify Details</span>
                    </Link>
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => { if (confirm('Delete task?')) onDelete(localTask.id); }}
                      className="text-red-500 focus:text-red-500 rounded-xl py-2.5 mt-1 bg-red-500/5"
                    >
                      <Trash2 className="mr-3 h-4 w-4" /> <span className="font-bold">Delete Project</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Body: Title and Description Spark */}
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground group-hover:text-primary transition-all duration-500">
              {localTask.projectName}
            </h3>
            {localTask.notes && (
              <p className="text-muted-foreground text-sm line-clamp-1 opacity-60 font-medium italic">
                &quot;{localTask.notes}&quot;
              </p>
            )}
          </div>

          {/* Footer Bar: Metrics and Metadata */}
          <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn(getStatusColor(localTask.workStatus), "border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-inner")}>
                {localTask.workStatus}
              </Badge>
              <Badge className={cn(getPaymentColor(localTask.paymentStatus), "border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-inner")}>
                {localTask.paymentStatus}
              </Badge>

              {/* Only show deadline if NOT fully paid */}
              {localTask.paymentStatus !== 'Paid' && (
                <>
                  {isOverdue && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-600 rounded-xl border border-red-500/20 animate-pulse">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Overdue</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/30 text-muted-foreground rounded-xl border border-secondary/50">
                    <Calendar className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Due: {formatDate(localTask.submissionDate)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 md:pl-6 md:border-l border-border/40">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">Total Valuation</span>
                <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">₹{localTask.total.toLocaleString()}</span>
              </div>

              <div className="w-32">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  <span>Pay Progress</span>
                  <span>{Math.round((localTask.amountPaid / (localTask.total || 1)) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      localTask.paymentStatus === 'Paid' ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min((localTask.amountPaid / (localTask.total || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

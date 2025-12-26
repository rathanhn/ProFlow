'use client';

import React from 'react';
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
    <div className="glass-card rounded-xl p-5 hover-lift relative group overflow-hidden transition-all duration-300 border-white/20 dark:border-white/10">
      {/* Gradient Border Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between sm:hidden mb-2">
              <div className="flex gap-2">
                <Badge className={cn(getStatusColor(localTask.workStatus), "border px-2 py-0.5 text-xs font-medium")}>
                  {localTask.workStatus}
                </Badge>
              </div>
              {/* Mobile Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tasks/${localTask.id}/edit?redirect=${encodeURIComponent(pathname)}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" /> Edit Task
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tasks/${localTask.id}/edit?redirect=${encodeURIComponent(pathname)}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" /> Edit Task
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMarkCompleted} disabled={isUpdating}>
                    <CheckSquare className="mr-2 h-4 w-4" /> Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePaymentReceived} disabled={isUpdating}>
                    <DollarSign className="mr-2 h-4 w-4" /> Mark Paid
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          onDelete(localTask.id);
                        }
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-xl font-bold mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              {localTask.projectName}
            </h3>

            {showClient && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                  <User className="h-3 w-3" />
                  <span className="truncate font-medium">{localTask.clientName}</span>
                </div>
              </div>
            )}

            <div className="hidden sm:flex flex-wrap gap-2 mt-2">
              <Badge className={cn(getStatusColor(localTask.workStatus), "border px-2.5 py-0.5 text-xs font-medium shadow-sm")}>
                {localTask.workStatus}
              </Badge>
              <Badge className={cn(getPaymentColor(localTask.paymentStatus), "border px-2.5 py-0.5 text-xs font-medium shadow-sm")}>
                {localTask.paymentStatus}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Soon
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <Link href={`/admin/tasks/${localTask.id}`}>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/admin/tasks/${localTask.id}/edit?redirect=${encodeURIComponent(pathname)}`}>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(localTask.id);
                  }
                }}
                className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {/* Quick Update Buttons */}
            <div className="flex gap-2">
              {localTask.workStatus !== 'Completed' && (
                <Button
                  size="sm"
                  className="btn-gradient text-xs h-9"
                  onClick={handleMarkCompleted}
                  disabled={isUpdating}
                >
                  Completed
                </Button>
              )}
              {localTask.paymentStatus !== 'Paid' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-9 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handlePaymentReceived}
                  disabled={isUpdating}
                >
                  Paid
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-dashed border-gray-200 dark:border-gray-700 my-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Pages
            </p>
            <p className="font-semibold text-foreground">{localTask.pages}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Rate
            </p>
            <p className="font-semibold text-foreground">₹{localTask.rate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Total
            </p>
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              ₹{localTask.total.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Paid
            </p>
            <p className={cn(
              "font-semibold",
              localTask.amountPaid >= localTask.total ? "text-green-600" : "text-foreground"
            )}>
              ₹{localTask.amountPaid.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">Due:</span>
            <span className={cn(
              "font-medium",
              isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-foreground"
            )}>
              {formatDate(localTask.submissionDate)}
            </span>
          </div>

          {localTask.assigneeName && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Assigned:</span>
              <span className="font-medium text-foreground">{localTask.assigneeName}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {localTask.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium text-foreground">
                {((localTask.amountPaid / localTask.total) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  localTask.amountPaid >= localTask.total
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                )}
                style={{ width: `${Math.min((localTask.amountPaid / localTask.total) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {localTask.projectFileLink && (
            <Button variant="outline" size="sm" className="h-8" asChild>
              <a
                href={localTask.projectFileLink}
                target="_blank"
                rel="noopener noreferrer"
                title="View Project File"
              >
                <ExternalLink className="h-3 w-3 mr-1" /> Project File
              </a>
            </Button>
          )}
          {localTask.outputFileLink && (
            <Button variant="outline" size="sm" className="h-8" asChild>
              <a
                href={localTask.outputFileLink}
                target="_blank"
                rel="noopener noreferrer"
                title="View Output File"
              >
                <ExternalLink className="h-3 w-3 mr-1" /> Output File
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

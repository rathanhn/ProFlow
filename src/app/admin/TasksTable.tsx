
'use client';

import * as React from 'react';
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
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Filter, User, Calendar, CreditCard, Edit, Trash2, Eye, Plus, Upload } from 'lucide-react';
import { Task, Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import StatusUpdater from './StatusUpdater';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskSheet from './TaskSheet';
import { SwipeActionItem, SwipeAction } from '@/components/ui/swipe-action';
import { LongPressMenu } from '@/components/ui/long-press';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useRouter } from 'next/navigation';
import { deleteTask } from '@/lib/firebase-service';

interface TasksTableProps {
  tasks: Task[];
  clients: Client[];
}

export default function TasksTable({ tasks: initialTasks, clients }: TasksTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const haptic = useHapticFeedback();
  const router = useRouter();
  const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const filteredTasks = tasks.filter(task =>
    task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    haptic.androidSwipeRefresh();
    // Refresh would typically reload data from parent component
    window.location.reload();
  };

  const handleRowClick = (task: Task) => {
    haptic.androidClick();
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      haptic.androidClick();
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      haptic.success();
    } catch (error) {
      console.error('Failed to delete task:', error);
      haptic.error();
    }
  };

  const getSwipeActions = (task: Task): SwipeAction[] => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      color: 'primary',
      onAction: () => {
        router.push(`/admin/tasks/${task.id}`);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      color: 'secondary',
      onAction: () => {
        router.push(`/admin/tasks/${task.id}/edit`);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'destructive',
      onAction: () => {
        if (confirm('Are you sure you want to delete this task?')) {
          handleDeleteTask(task.id);
        }
      },
    },
  ];

  const getLongPressActions = (task: Task) => [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => router.push(`/admin/tasks/${task.id}`),
    },
    {
      id: 'edit',
      label: 'Edit Task',
      icon: Edit,
      onClick: () => router.push(`/admin/tasks/${task.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete Task',
      icon: Trash2,
      onClick: () => {
        if (confirm('Are you sure you want to delete this task?')) {
          handleDeleteTask(task.id);
        }
      },
      variant: 'destructive' as const,
    },
  ];

  const fabActions = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: Plus,
      onClick: () => {
        haptic.androidClick();
        router.push('/admin/tasks/new');
      },
    },
  ];

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="fab-safe-bottom">
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Manage all your client projects.</CardDescription>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by project or client..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <RippleButton variant="outline" className="shrink-0 w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </RippleButton>
              <Link href="/admin/tasks/import">
                <RippleButton variant="outline" className="shrink-0 w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" /> Import Tasks
                </RippleButton>
              </Link>
            </div>
          </CardHeader>
        <CardContent>
          <div className="hidden md:block relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Work Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task: Task) => (
                  <TableRow key={task.id} onClick={() => handleRowClick(task)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          className="hidden h-9 w-9 sm:flex cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            const client = clients.find(c => c.id === task.clientId);
                            const imageUrl = client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.clientName)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
                            openViewer(imageUrl, task.clientName, client?.email);
                          }}
                        >
                          <AvatarImage src={clients.find(c => c.id === task.clientId)?.avatar || `https://placehold.co/32x32.png`} alt="Avatar" />
                          <AvatarFallback>{task.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="font-medium whitespace-nowrap">{task.clientName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{task.projectName}</TableCell>
                    <TableCell>
                      <div className="font-medium whitespace-nowrap">₹{(task.total || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Paid: ₹{(task.amountPaid || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <StatusUpdater task={task} field="workStatus" />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <StatusUpdater task={task} field="paymentStatus" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {task.assigneeId && task.assigneeName ? (
                        <Link href={`/profile/${task.assigneeId}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {task.assigneeName}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(task.submissionDate).toLocaleDateString()}</TableCell>
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
                            <Link href={`/admin/tasks/${task.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tasks/${task.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
          {/* Mobile View with Swipe Actions */}
          <div className="grid gap-4 md:hidden">
            {filteredTasks.map((task: Task) => (
              <SwipeActionItem
                key={task.id}
                rightActions={getSwipeActions(task)}
                className="rounded-lg"
              >
                <LongPressMenu actions={getLongPressActions(task)}>
                  <Card className="cursor-pointer" onClick={() => handleRowClick(task)}>
                    <CardHeader>
                      <CardTitle className="text-base">{task.projectName}</CardTitle>
                      <CardDescription>{task.clientName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Work Status</span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <StatusUpdater task={task} field="workStatus" />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <StatusUpdater task={task} field="paymentStatus" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span>₹{(task.total || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{task.assigneeName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.submissionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LongPressMenu>
              </SwipeActionItem>
            ))}
          </div>
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />

      {selectedTask && <TaskSheet task={selectedTask} isOpen={isSheetOpen} onClose={handleSheetClose} />}

      {/* Profile Image Viewer */}
      <ProfileImageViewer
        isOpen={isOpen}
        onClose={closeViewer}
        imageUrl={imageData.imageUrl}
        userName={imageData.userName}
        userEmail={imageData.userEmail}
      />
    </>
  );
}

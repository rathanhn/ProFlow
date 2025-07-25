
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
import { MoreHorizontal, Search, Filter, User, Calendar, CreditCard } from 'lucide-react';
import { Task, Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatusUpdater from './StatusUpdater';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskSheet from './TaskSheet';

interface TasksTableProps {
  tasks: Task[];
  clients: Client[];
}

export default function TasksTable({ tasks, clients }: TasksTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  const filteredTasks = tasks.filter(task =>
    task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedTask(null);
  };

  return (
    <>
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
            <Button variant="outline" className="shrink-0 w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
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
                        <Avatar className="hidden h-9 w-9 sm:flex">
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
      {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
        {filteredTasks.map((task: Task) => (
            <Card key={task.id} onClick={() => handleRowClick(task)} className="cursor-pointer">
                <CardHeader>
                    <CardTitle className="text-base">{task.projectName}</CardTitle>
                    <CardDescription>{task.clientName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Work Status</span>
                        <span onClick={(e) => e.stopPropagation()}><StatusUpdater task={task} field="workStatus" /></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span onClick={(e) => e.stopPropagation()}><StatusUpdater task={task} field="paymentStatus" /></span>
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
        ))}
        </div>
      {selectedTask && <TaskSheet task={selectedTask} isOpen={isSheetOpen} onClose={handleSheetClose} />}
    </>
  );
}

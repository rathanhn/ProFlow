
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText } from 'lucide-react';

interface CreatorTasksTableProps {
  tasks: Task[];
  statusColors: Record<string, string>;
  creatorId: string;
}

export default function CreatorTasksTable({ tasks, statusColors, creatorId }: CreatorTasksTableProps) {
  const router = useRouter();
  
  const handleRowClick = (taskId: string) => {
    router.push(`/creator/${creatorId}/tasks/${taskId}`);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {tasks.map((task: Task) => (
          <Card key={task.id} onClick={() => handleRowClick(task.id)} className="cursor-pointer">
            <CardHeader>
                <CardTitle className="text-base">{task.projectName}</CardTitle>
                <CardDescription>Client: {task.clientName}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className={statusColors[task.workStatus]}>
                      {task.workStatus}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {task.pages} pages
                    </div>
                </div>
                 <div className="text-xs text-muted-foreground mt-4 pt-2 border-t flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {new Date(task.submissionDate).toLocaleDateString()}</span>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    
      {/* Desktop View */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Work Status</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead className="text-right">Total Pages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task: Task) => (
              <TableRow key={task.id} onClick={() => handleRowClick(task.id)} className="cursor-pointer">
                <TableCell className="font-medium whitespace-nowrap">{task.projectName}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{task.clientName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[task.workStatus]}>
                    {task.workStatus}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(task.submissionDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{task.pages}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

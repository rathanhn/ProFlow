
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
    <div className="w-full overflow-x-auto">
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
  );
}

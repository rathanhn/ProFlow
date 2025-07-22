
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

interface ClientProjectsTableProps {
  tasks: Task[];
  statusColors: Record<string, string>;
  clientId: string;
}

export default function ClientProjectsTable({ tasks, statusColors, clientId }: ClientProjectsTableProps) {
  const router = useRouter();
  
  const handleRowClick = (taskId: string) => {
    router.push(`/client/${clientId}/projects/${taskId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>Work Status</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task: Task) => (
          <TableRow key={task.id} onClick={() => handleRowClick(task.id)} className="cursor-pointer">
            <TableCell className="font-medium">{task.projectName}</TableCell>
            <TableCell>
              <Badge variant="outline" className={statusColors[task.workStatus]}>
                {task.workStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={statusColors[task.paymentStatus]}>
                {task.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-right">₹{task.total.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

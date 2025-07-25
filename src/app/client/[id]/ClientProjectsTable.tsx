
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
import { Card, CardContent } from '@/components/ui/card';

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
    <>
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {tasks.map((task: Task) => (
          <Card key={task.id} onClick={() => handleRowClick(task.id)} className="cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-base flex-1 pr-4">{task.projectName}</p>
                <p className="font-bold text-lg">₹{task.total.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Badge variant="outline" className={statusColors[task.workStatus]}>
                    {task.workStatus}
                  </Badge>
                  <Badge variant="outline" className={statusColors[task.paymentStatus]}>
                    {task.paymentStatus}
                  </Badge>
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
              <TableHead>Work Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task: Task) => (
              <TableRow key={task.id} onClick={() => handleRowClick(task.id)} className="cursor-pointer">
                <TableCell className="font-medium whitespace-nowrap">{task.projectName}</TableCell>
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
                <TableCell className="text-right whitespace-nowrap">₹{task.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

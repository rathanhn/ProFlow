
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import TaskDetails from '@/components/TaskDetails';
import Link from 'next/link';
import { Edit } from 'lucide-react';

interface TaskSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskSheet({ task, isOpen, onClose }: TaskSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-none sm:max-w-[540px] p-0">
        <SheetHeader className="p-6">
          <SheetTitle>{task.projectName}</SheetTitle>
          <SheetDescription>
            Detailed view of the task. Click edit to make changes.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-6">
          <TaskDetails task={task} />
        </div>
        <SheetFooter className="p-6 bg-muted/50 mt-auto">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <Link href={`/admin/tasks/${task.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Task
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

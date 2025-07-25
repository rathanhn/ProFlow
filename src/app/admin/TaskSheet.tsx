
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
  const titleId = `sheet-title-${task.id}`;
  const descriptionId = `sheet-description-${task.id}`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full max-w-none sm:max-w-[540px] p-0 flex flex-col"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle id={titleId}>{task.projectName}</SheetTitle>
          <SheetDescription id={descriptionId}>
            Detailed view of the task. Click edit to make changes.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <TaskDetails task={task} />
        </div>
        <SheetFooter className="p-6 mt-auto bg-background border-t">
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

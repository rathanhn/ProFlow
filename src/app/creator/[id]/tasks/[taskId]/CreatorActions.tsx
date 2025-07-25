
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';
import { Task, WorkStatus } from '@/lib/types';
import { createNotification, updateTask } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const workStatuses: WorkStatus[] = ['Pending', 'In Progress', 'Completed'];

export default function CreatorActions({ task }: { task: Task }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleWorkStatusChange = async (newStatus: WorkStatus) => {
    try {
      await updateTask(task.id, { workStatus: newStatus });
      toast({
        title: 'Status Updated!',
        description: `${task.projectName}'s work status is now ${newStatus}.`,
      });
      router.refresh(); // Refresh to show the updated status
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update the work status.',
        variant: 'destructive',
      });
    }
  };

    const notifyClientOfUpload = async (fileType: string) => {
        try {
            await createNotification({
                userId: task.clientId,
                message: `A ${fileType} has been uploaded for project: ${task.projectName}.`,
                link: `/client/${task.clientId}/projects/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to send notification to client:", error);
            // Don't block the main flow, just log it
        }
    }


  const handleOutputFileUpload = async (url: string) => {
     try {
      await updateTask(task.id, { outputFileLink: url });
      toast({
        title: 'File Uploaded!',
        description: 'The output file has been linked to the task.',
      });
      await notifyClientOfUpload('new output file');
      router.refresh();
    } catch (error) {
       toast({
        title: 'Update Failed',
        description: 'Could not link the output file.',
        variant: 'destructive',
      });
    }
  }
  
  const handleProjectFileUpload = async (url: string) => {
     try {
      await updateTask(task.id, { projectFileLink: url });
      toast({
        title: 'File Uploaded!',
        description: 'The project file has been linked to the task.',
      });
      await notifyClientOfUpload('new project file');
      router.refresh();
    } catch (error) {
       toast({
        title: 'Update Failed',
        description: 'Could not link the project file.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Actions</CardTitle>
        <CardDescription>Update project status and upload final files.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Work Status</Label>
          <Select value={task.workStatus} onValueChange={handleWorkStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select work status" />
            </SelectTrigger>
            <SelectContent>
              {workStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-2">
          <Label>Project File</Label>
          <FileUpload 
            value={task.projectFileLink}
            onChange={handleProjectFileUpload}
            folder="project_files"
          />
        </div>
        <div className="space-y-2">
          <Label>Output File</Label>
          <FileUpload 
            value={task.outputFileLink}
            onChange={handleOutputFileUpload}
            folder="output_files"
          />
        </div>
      </CardContent>
    </Card>
  );
}

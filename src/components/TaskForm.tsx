
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Task, Client, WorkStatus, PaymentStatus, Assignee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addTask, updateTask, getClients, getTasks, getAssignees, addAssignee, createNotification } from '@/lib/firebase-service';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { DollarSign, PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import PaymentDialog from './PaymentDialog';
import FileUpload from './FileUpload';


const workStatuses = ['Pending', 'In Progress', 'Completed'] as const;

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectName: z.string().min(1, 'Project name is required'),
  pages: z.coerce.number().min(1, 'Pages must be at least 1'),
  rate: z.coerce.number().min(1, 'Rate must be at least 1'),
  workStatus: z.enum(workStatuses),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
  projectFileLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  outputFileLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const newAssigneeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email.").optional(),
});

interface TaskFormProps {
  task?: Task;
}

export default function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [isAddAssigneeDialogOpen, setAddAssigneeDialogOpen] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const fetchClients = React.useCallback(async () => {
      const clientData = await getClients();
      setClients(clientData);
  }, []);

  const fetchAssignees = React.useCallback(async () => {
      const assigneeData = await getAssignees();
      setAssignees(assigneeData);
  }, []);


  React.useEffect(() => {
      fetchClients();
      fetchAssignees();
  }, [fetchClients, fetchAssignees]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: task?.clientName || '',
      projectName: task?.projectName || '',
      pages: task?.pages || 1,
      rate: task?.rate || 100,
      workStatus: task?.workStatus || 'Pending',
      assigneeId: task?.assigneeId || 'unassigned',
      notes: task?.notes || '',
      projectFileLink: task?.projectFileLink || '',
      outputFileLink: task?.outputFileLink || '',
    },
  });

  const handleAddAssignee = async () => {
    try {
        const validation = newAssigneeSchema.safeParse({ name: newAssigneeName, email: newAssigneeEmail });
        if (!validation.success) {
            toast({ title: "Invalid Input", description: validation.error.errors[0].message, variant: 'destructive' });
            return;
        }

        const newAssignee = await addAssignee({ name: newAssigneeName, email: newAssigneeEmail });
        await fetchAssignees(); // Re-fetch the list
        form.setValue('assigneeId', newAssignee.id); // Set the newly added assignee as selected
        toast({ title: "Creator Added", description: `${newAssignee.name} has been added to the team.` });
        setNewAssigneeName("");
        setNewAssigneeEmail("");
        setAddAssigneeDialogOpen(false); // Close the dialog
    } catch (error) {
        console.error("Failed to add assignee:", error);
        toast({ title: 'Error', description: 'Failed to add creator.', variant: 'destructive' });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const client = clients.find(c => c.name === values.clientName);
        if (!client) {
            toast({
                title: 'Error',
                description: 'Selected client not found.',
                variant: 'destructive'
            });
            return;
        }

        const assignee = assignees.find(a => a.id === values.assigneeId);

        const finalValues = {
            ...values,
            assigneeId: assignee && assignee.id !== 'unassigned' ? assignee.id : '',
            assigneeName: assignee && assignee.id !== 'unassigned' ? assignee.name : '',
        };

        if (task) {
             const taskData = {
                ...finalValues,
                clientId: client.id,
                total: values.pages * values.rate,
                workStatus: values.workStatus as WorkStatus,
            };
            await updateTask(task.id, taskData);
            toast({
                title: 'Task Updated!',
                description: `Project "${values.projectName}" has been saved.`,
            });
            
            // Notify if assignee changed
            if (taskData.assigneeId && taskData.assigneeId !== task.assigneeId) {
                await createNotification({
                    userId: taskData.assigneeId,
                    message: `You have been assigned a new task: ${taskData.projectName}.`,
                    link: `/creator/${taskData.assigneeId}/tasks/${task.id}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                });
            }

            // Notify client on file uploads
            if (values.projectFileLink && values.projectFileLink !== task.projectFileLink) {
                 await createNotification({
                    userId: client.id,
                    message: `A new project file was uploaded for: ${task.projectName}.`,
                    link: `/client/${client.id}/projects/${task.id}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                });
            }
             if (values.outputFileLink && values.outputFileLink !== task.outputFileLink) {
                 await createNotification({
                    userId: client.id,
                    message: `A new output file was uploaded for: ${task.projectName}.`,
                    link: `/client/${client.id}/projects/${task.id}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                });
            }


        } else {
            const newTaskData = {
                ...finalValues,
                clientId: client.id,
                total: values.pages * values.rate,
                workStatus: values.workStatus as WorkStatus,
                paymentStatus: 'Unpaid' as PaymentStatus,
                amountPaid: 0,
                acceptedDate: new Date().toISOString(),
                submissionDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
                slNo: (await getTasks()).length + 1
            }
            const addedTask = await addTask(newTaskData as Omit<Task, 'id'>);
            toast({
                title: 'Task Created!',
                description: `Project "${values.projectName}" has been added.`,
            });
            
            // Notify if assigned on creation
            if (addedTask && newTaskData.assigneeId) {
                 await createNotification({
                    userId: newTaskData.assigneeId,
                    message: `You have been assigned a new task: ${newTaskData.projectName}.`,
                    link: `/creator/${newTaskData.assigneeId}/tasks/${addedTask.id}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                });
            }
        }
        router.push('/admin/tasks');
        router.refresh();
    } catch (error) {
        console.error("Failed to save task:", error);
        toast({
            title: 'Error',
            description: 'Failed to save task. Please try again.',
            variant: 'destructive'
        });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <CardTitle>{task ? 'Edit Task' : 'Create a New Task'}</CardTitle>
                    <CardDescription>{task ? 'Update task details and payment status.' : 'Fill in the form to create a new task.'}</CardDescription>
                </div>
                 {task && (
                    <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(true)} className="w-full sm:w-auto">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Update Payment
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!task}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client: Client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. E-commerce Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a creator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">N/A</SelectItem>
                            {assignees.map((assignee: Assignee) => (
                              <SelectItem key={assignee.id} value={assignee.id}>
                                {assignee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog open={isAddAssigneeDialogOpen} onOpenChange={setAddAssigneeDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Creator</DialogTitle>
                                    <DialogDescription>
                                        Enter the details for the new creator. They will then be available for assignment.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-assignee-name">Name</Label>
                                        <Input id="new-assignee-name" value={newAssigneeName} onChange={(e) => setNewAssigneeName(e.target.value)} placeholder="e.g. Alex" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-assignee-email">Email (Optional)</Label>
                                        <Input id="new-assignee-email" type="email" value={newAssigneeEmail} onChange={(e) => setNewAssigneeEmail(e.target.value)} placeholder="alex@example.com" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleAddAssignee}>Add Creator</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="workStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Pages</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate per Page (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any relevant notes here..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                        control={form.control}
                        name="projectFileLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Project File</FormLabel>
                            <FormControl>
                                <FileUpload 
                                    value={field.value}
                                    onChange={field.onChange}
                                    folder="project_files"
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="outputFileLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Output File</FormLabel>
                            <FormControl>
                                <FileUpload 
                                     value={field.value}
                                     onChange={field.onChange}
                                     folder="output_files"
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {task && (
        <PaymentDialog 
            task={task} 
            isOpen={isPaymentDialogOpen} 
            onClose={() => {
                setPaymentDialogOpen(false);
                router.refresh(); // Refresh data on the edit page
            }}
        />
      )}
    </>
  );
}

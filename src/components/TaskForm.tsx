
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
  FormDescription,
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
import { addTask, updateTask, getClients, getTasks, getAssignees, addAssignee, createNotification, getNextProjectNo, getLatestProjectNoForClient } from '@/lib/firebase-service';
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { generateBrief } from '@/ai/flows/generateBriefFlow';
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
import { DollarSign, PlusCircle, Loader2, Wand2, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import PaymentDialog from './PaymentDialog';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';


const workStatuses = ['Pending', 'In Progress', 'Completed'] as const;

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectNo: z.string().optional(),
  projectName: z.string().min(1, 'Project name is required'),
  pages: z.coerce.number().min(1, 'Pages must be at least 1'),
  rate: z.coerce.number().min(1, 'Rate must be at least 1'),
  workStatus: z.enum(workStatuses),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
  projectFileLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  outputFileLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  acceptedDate: z.string().optional(),
  submissionDate: z.string().optional(),
}).refine((data) => {
  // We can't easily access 'task' here, so we handle this in onSubmit or via a custom check
  return true;
}, {
  message: "Total amount cannot be less than the amount already paid.",
  path: ["pages"],
});

const newAssigneeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email.").optional(),
});

interface TaskFormProps {
  task?: Task;
  redirectPath?: string;
  initialClientId?: string;
}

export default function TaskForm({ task, redirectPath, initialClientId }: TaskFormProps) {
  // 1. Basic Hooks & State
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [isAddAssigneeDialogOpen, setAddAssigneeDialogOpen] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProjectNoLoading, setIsProjectNoLoading] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);


  // 2. Computed Values
  const initialClientName = React.useMemo(() => {
    if (task) return task.clientName;
    if (initialClientId && clients.length > 0) {
      const found = clients.find(c => c.id === initialClientId);
      return found ? found.name : '';
    }
    return '';
  }, [task, initialClientId, clients]);

  // 3. Form Initialization
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: initialClientName || '',
      projectNo: task?.projectNo || '',
      projectName: task?.projectName || '',
      pages: task?.pages || 1,
      rate: task?.rate || 100,
      workStatus: task?.workStatus || 'Pending',
      assigneeId: task?.assigneeId || 'unassigned',
      notes: task?.notes || '',
      projectFileLink: task?.projectFileLink || '',
      outputFileLink: task?.outputFileLink || '',
      acceptedDate: task?.acceptedDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      submissionDate: task?.submissionDate?.split('T')[0] ?? new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    },
  });

  // 4. Data Fetching & Callbacks
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

  // Handle client name updates if clients load after mount
  React.useEffect(() => {
    if (!task && initialClientName && !form.getValues('clientName')) {
      form.setValue('clientName', initialClientName);
    }
  }, [initialClientName, form, task]);

  // Watch for client selection to auto-set rate and project number
  const selectedClientName = form.watch('clientName');

  const selectedClient = React.useMemo(
    () => clients.find(c => c.name === selectedClientName),
    [clients, selectedClientName]
  );

  React.useEffect(() => {
    console.log("[TaskForm] Client selection effect triggered:", { selectedClientName, selectedClientId: selectedClient?.id });
    if (selectedClient && !task) {
      const suggestProjectNo = async () => {
        setIsProjectNoLoading(true);
        console.log(`[TaskForm] Requesting next PRJ for client: ${selectedClient.name} (${selectedClient.id})`);
        const nextNo = await getNextProjectNo(selectedClient.id);
        console.log(`[TaskForm] Received suggested PRJ: ${nextNo}`);
        form.setValue('projectNo', nextNo);
        setIsProjectNoLoading(false);
      };
      suggestProjectNo();
    }
  }, [selectedClient, task, form]);

  // KEYBOARD SHORTCUT: Cmd/Ctrl + Enter to fast-launch
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const formValues = form.getValues();
        if (formValues.projectName && formValues.clientName) {
          form.handleSubmit(onSubmit)();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form]);
  const clientRates = React.useMemo(() => {
    if (selectedClient?.defaultRates && selectedClient.defaultRates.length > 0) {
      return selectedClient.defaultRates;
    }
    if (selectedClient?.defaultRate) {
      return [{ label: 'Default rate', rate: selectedClient.defaultRate }];
    }
    return [];
  }, [selectedClient]);

  React.useEffect(() => {
    if (selectedClient && !task) { // Only auto-set on new tasks
      if (clientRates.length > 0) {
        const rateToUse = clientRates[0].rate;
        form.setValue('rate', rateToUse);
      }

      // Auto-calculate deadline based on payment terms
      if (selectedClient.paymentTerms) {
        const today = new Date();
        let daysToAdd = 7; // default fallback
        if (selectedClient.paymentTerms === 'Due on Receipt') daysToAdd = 1;
        else if (selectedClient.paymentTerms === 'Net 5') daysToAdd = 5;
        else if (selectedClient.paymentTerms === 'Net 15') daysToAdd = 15;
        else if (selectedClient.paymentTerms === 'Net 30') daysToAdd = 30;

        const dueDate = new Date(today.setDate(today.getDate() + daysToAdd)).toISOString().split('T')[0];
        form.setValue('submissionDate', dueDate);
      }
    }
  }, [selectedClient, clientRates, form, task]);

  // Watch values for live calculation
  const pages = form.watch('pages');
  const rate = form.watch('rate');
  const calculatedTotal = (pages || 0) * (rate || 0);

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
    setIsSubmitting(true);
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
        const total = values.pages * values.rate;
        if (total < (task.amountPaid || 0)) {
          toast({
            title: 'Invalid Adjustment',
            description: `Total (₹${total}) cannot be less than the amount already paid (₹${task.amountPaid}).`,
            variant: 'destructive'
          });
          setIsSubmitting(false);
          return;
        }

        const taskData = {
          ...finalValues,
          clientId: client.id,
          total: total,
          workStatus: values.workStatus as WorkStatus,
        };
        await updateTask(task.id, taskData);
        toast({
          title: 'Task Updated!',
          description: `Project "${values.projectName}" (${values.projectNo}) has been saved.`,
        });

        // Notify if assignee changed
        if (taskData.assigneeId && taskData.assigneeId !== task.assigneeId) {
          await createNotification({
            userId: taskData.assigneeId,
            message: `You have been assigned a project: ${taskData.projectName} (${values.projectNo}).`,
            link: `/creator/${taskData.assigneeId}/tasks/${task.id}`,
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
          acceptedDate: values.acceptedDate ? new Date(values.acceptedDate).toISOString() : new Date().toISOString(),
          submissionDate: values.submissionDate ? new Date(values.submissionDate).toISOString() : new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        }
        // Remove projectNo from newTaskData if it's empty, backend will generate it
        if (!newTaskData.projectNo) delete newTaskData.projectNo;

        const addedTask = await addTask(newTaskData as Omit<Task, 'id' | 'slNo'> & { projectNo?: string });

        // Success Celebration!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#ec4899']
        });

        toast({
          title: 'Task Created!',
          description: `Project "${values.projectName}" has been added as ${addedTask.projectNo}.`,
        });

        // Notify if assigned on creation
        if (addedTask && newTaskData.assigneeId) {
          await createNotification({
            userId: newTaskData.assigneeId,
            message: `New Assignment: ${newTaskData.projectName} (${addedTask.projectNo}).`,
            link: `/creator/${newTaskData.assigneeId}/tasks/${addedTask.id}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Redirect based on whether we're creating or editing
      if (redirectPath) {
        router.push(redirectPath);
      } else if (task) {
        // For editing, go back to the task detail page
        router.push(`/admin/tasks/${task.id}`);
      } else {
        // For creating, go to the tasks list
        router.push('/admin/tasks');
      }
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gradient-indigo mb-2">
          {task ? 'Edit Project' : 'Initiate Project'}
        </h1>
        <p className="text-muted-foreground font-medium">
          {task ? 'Update the details and monitor the progress of your project.' : 'Launch a new collaboration by filling out the project blueprints below.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card rounded-3xl p-6 border-white/20 dark:border-white/10 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-lg font-bold">Project Blueprint</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Client Partner</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!task}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-secondary/50 border-none rounded-xl">
                              <SelectValue placeholder="Select a partner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
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
                    name="projectNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Project Reference (Client Case)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="e.g. PRJ 95"
                              {...field}
                              className="h-11 bg-primary/5 border-2 border-primary/20 rounded-xl font-mono font-black text-xl text-primary focus:ring-4 ring-primary/10 transition-all text-center tracking-tighter"
                              disabled={isProjectNoLoading}
                            />
                            {isProjectNoLoading && (
                              <div className="absolute inset-y-0 right-3 flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-[10px]">Unique ID used for tracking and invoicing.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {clientRates.length > 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Design Style / Page Category</Label>
                    <Select onValueChange={(val) => {
                      const style = clientRates.find(r => r.label === val);
                      if (style) form.setValue('rate', style.rate);
                    }}>
                      <SelectTrigger className="h-11 bg-primary/5 border-none rounded-xl font-bold">
                        <SelectValue placeholder="Select Design Style" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {clientRates.map((style) => (
                          <SelectItem key={style.label} value={style.label} className="py-3">
                            <div className="flex justify-between items-center w-full min-w-[200px]">
                              <span className="font-bold">{style.label}</span>
                              <span className="text-primary font-black ml-4">₹{style.rate}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Title of Project</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Q4 Marketing Campaign"
                          {...field}
                          className="h-11 bg-secondary/50 border-none rounded-xl font-medium focus:ring-2 ring-primary/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Internal Brief / Notes</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-1.5 transition-all"
                          onClick={async () => {
                            const pName = form.getValues('projectName');
                            const cName = form.getValues('clientName');
                            if (!pName || !cName) {
                              toast({ title: "Input Required", description: "Enter Project Name and Select Client first.", variant: 'destructive' });
                              return;
                            }
                            setIsGeneratingBrief(true);
                            try {
                              const result = await generateBrief({ projectName: pName, clientName: cName, existingNotes: field.value });
                              form.setValue('notes', result.brief);
                              toast({ title: "Brief Generated!", description: "AI has polished your project description." });
                            } catch (err) {
                              toast({ title: "Generation Failed", description: "Could not generate brief. Check API key.", variant: 'destructive' });
                            } finally {
                              setIsGeneratingBrief(false);
                            }
                          }}
                          disabled={isGeneratingBrief}
                        >
                          {isGeneratingBrief ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                          {isGeneratingBrief ? 'Generating...' : 'Magic Describe'}
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Textarea
                            placeholder="Specify project goals, specific requirements, or milestones..."
                            className="resize-none min-h-[120px] bg-secondary/50 border-none rounded-xl focus:ring-2 ring-primary/20 transition-all font-medium py-4 px-5"
                            {...field}
                          />
                          <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Workflow & Files Section */}
              <div className="glass-card rounded-3xl p-6 border-white/20 dark:border-white/10 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10 mb-2">
                  <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                  <h2 className="text-lg font-bold">Workflow & Resources</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectFileLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Source Material</FormLabel>
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
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Final Deliverable</FormLabel>
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
              </div>
            </div>

            {/* Sidebar Stats Section */}
            <div className="space-y-8">
              <div className="glass-card rounded-3xl p-6 border-white/20 dark:border-white/10 shadow-xl space-y-6 sticky top-24">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10 mb-2">
                  <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                  <h2 className="text-lg font-bold">Logistics</h2>
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Assigned Creator</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-secondary/50 border-none rounded-xl">
                                <SelectValue placeholder="Assign someone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/20">
                              <SelectItem value="unassigned">Keep Unassigned</SelectItem>
                              {assignees.map((assignee: Assignee) => (
                                <SelectItem key={assignee.id} value={assignee.id}>
                                  {assignee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={isAddAssigneeDialogOpen} onOpenChange={setAddAssigneeDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary hover:text-white transition-all">
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card border-white/20">
                              <DialogHeader>
                                <DialogTitle>Onboard New Creator</DialogTitle>
                                <DialogDescription>
                                  Add a new professional to your creative team.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-assignee-name" className="text-xs uppercase font-bold text-muted-foreground">Full Name</Label>
                                  <Input id="new-assignee-name" value={newAssigneeName} onChange={(e) => setNewAssigneeName(e.target.value)} placeholder="e.g. John Doe" className="bg-secondary/50 border-none h-10" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-assignee-email" className="text-xs uppercase font-bold text-muted-foreground">Email Address</Label>
                                  <Input id="new-assignee-email" type="email" value={newAssigneeEmail} onChange={(e) => setNewAssigneeEmail(e.target.value)} placeholder="john@proflow.com" className="bg-secondary/50 border-none h-10" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" onClick={handleAddAssignee} className="w-full glow-blue">Confirm Recruitment</Button>
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
                        <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Activity Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={cn(
                              "h-11 border-none rounded-xl font-bold transition-all duration-300",
                              field.value === 'Pending' ? "bg-amber-500/10 text-amber-600" :
                                field.value === 'In Progress' ? "bg-blue-500/10 text-blue-600" :
                                  field.value === 'Completed' ? "bg-emerald-500/10 text-emerald-600" :
                                    "bg-secondary/50"
                            )}>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            {workStatuses.map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className={cn(
                                  "rounded-lg my-1",
                                  status === 'Pending' ? "focus:bg-amber-500/10 focus:text-amber-600" :
                                    status === 'In Progress' ? "focus:bg-blue-500/10 focus:text-blue-600" :
                                      status === 'Completed' ? "focus:bg-emerald-500/10 focus:text-emerald-600" : ""
                                )}
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Volume (Pages)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-secondary/50 border-none rounded-xl font-bold" />
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
                          <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Unit Rate (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-secondary/50 border-none rounded-xl font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="py-4 px-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mb-1">Total Valuation</p>
                    <p className="text-3xl font-black text-gradient-indigo">
                      ₹{calculatedTotal.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="acceptedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Kickoff Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-10 bg-secondary/50 border-none rounded-xl text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submissionDate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-end mb-2">
                            <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Deadline Date</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-black uppercase text-primary hover:bg-primary/10 rounded-lg"
                              onClick={() => field.onChange(new Date().toISOString().split('T')[0])}
                            >
                              Set Today
                            </Button>
                          </div>
                          <FormControl>
                            <Input type="date" {...field} className="h-10 bg-secondary/50 border-none rounded-xl text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-2xl font-bold text-lg glow-blue active:scale-95 transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        task ? 'Update Project' : 'Launch Project'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="w-full text-muted-foreground hover:bg-white/5 rounded-2xl h-10"
                    >
                      Discard Changes
                    </Button>

                    {task && (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setPaymentDialogOpen(true)}
                        className="text-xs text-primary font-bold decoration-primary/30"
                      >
                        <DollarSign className="mr-1 h-3 w-3" />
                        Manage Payment Ledger
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {task && (
        <PaymentDialog
          task={task}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}



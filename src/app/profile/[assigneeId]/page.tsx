
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ReportCreatorButton from './ReportCreatorButton';
import { Assignee, Task } from '@/lib/types';

type Props = {
    params: { assigneeId: string };
};

export default async function AssigneeProfilePage({ params }: Props) {
    const assigneeId = params.assigneeId;
    const rawAssignee = await getAssignee(assigneeId);

    if (!rawAssignee) {
        notFound();
    }
    const assignee = JSON.parse(JSON.stringify(rawAssignee)) as Assignee;

    const rawTasks = await getTasksByAssigneeId(assigneeId);
    const tasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
    
    return (
        <DashboardLayout>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                   <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback className="text-3xl">{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-2xl font-bold">{assignee.name}</h1>
                                <p className="text-muted-foreground">Creator</p>

                                {assignee.description && (
                                    <p className="mt-4 text-sm text-center">{assignee.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {assignee.email && (
                                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                   <a href={`mailto:${assignee.email}`}>
                                     <Mail className="h-4 w-4" />
                                     <span>{assignee.email}</span>
                                   </a>
                                </Button>
                           )}
                           {assignee.mobile && (
                                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                    <a href={`tel:${assignee.mobile}`}>
                                       <Phone className="h-4 w-4" />
                                       <span>{assignee.mobile}</span>
                                    </a>
                                </Button>
                           )}
                            {assignee.mobile && (
                                <Button className="w-full justify-start gap-2" asChild>
                                   <a href={`https://wa.me/${assignee.mobile.replace(/D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                     <MessageSquare className="h-4 w-4" />
                                     <span>Chat on WhatsApp</span>
                                   </a>
                                </Button>
                           )}
                           <ReportCreatorButton assignee={assignee} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project History</CardTitle>
                            <CardDescription>
                                A list of all projects assigned to {assignee.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                            <div>
                                                <p className="font-semibold">{task.projectName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Client: {task.clientName}
                                                </p>
                                            </div>
                                             <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/tasks/${task.id}`}>
                                                    View Task
                                                </Link>
                                             </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center p-4">
                                        No projects have been assigned to this creator yet.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

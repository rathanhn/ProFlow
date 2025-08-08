
import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Award, Users, FileText, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import ReportCreatorButton from './ReportCreatorButton';

export default async function ProfilePage({ params }: { params: Promise<{ assigneeId: string }> }) {
    const { assigneeId } = await params;
    const rawAssignee = await getAssignee(assigneeId);

    if (!rawAssignee) {
        notFound();
    }
    const assignee = JSON.parse(JSON.stringify(rawAssignee)) as Assignee;

    const rawTasks = await getTasksByAssigneeId(assigneeId);
    const tasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
    
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/team">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Creator Profile</h1>
                        <p className="text-muted-foreground">View detailed information about this creator.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={assignee.avatar} />
                                    <AvatarFallback className="text-2xl">{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{assignee.name}</CardTitle>
                                    <CardDescription>{assignee.email}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assignee.bio && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Bio</h4>
                                    <p className="text-sm">{assignee.bio}</p>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{assignee.email}</span>
                                </div>
                                {assignee.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{assignee.phone}</span>
                                    </div>
                                )}
                                {assignee.location && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{assignee.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <ReportCreatorButton assignee={assignee} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats and Tasks */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                                <CardDescription>Overview of creator's performance and activity.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{tasks.length}</div>
                                        <div className="text-sm text-muted-foreground">Total Tasks</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {tasks.filter(t => t.workStatus === 'Completed').length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Completed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {tasks.filter(t => t.workStatus === 'In Progress').length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">In Progress</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {tasks.filter(t => t.workStatus === 'Pending').length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Pending</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Tasks */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription>Latest tasks assigned to this creator.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {tasks.length > 0 ? (
                                    <div className="space-y-4">
                                        {tasks.slice(0, 5).map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{task.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                                </div>
                                                <Badge variant={
                                                    task.workStatus === 'Completed' ? 'default' :
                                                    task.workStatus === 'In Progress' ? 'secondary' :
                                                    'outline'
                                                }>
                                                    {task.workStatus}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No tasks assigned yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

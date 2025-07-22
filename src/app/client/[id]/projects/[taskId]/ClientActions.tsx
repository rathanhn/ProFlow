
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { Bell, Zap } from 'lucide-react';

export default function ClientActions({ task, client }: { task: Task, client: Client }) {
    const { toast } = useToast();

    const handleNotify = async () => {
        try {
            await createNotification({
                userId: 'admin', // Generic admin user for notifications
                message: `${client.name} has marked project '${task.projectName}' as paid.`,
                link: `/admin/tasks/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Admin Notified!",
                description: "We've notified the admin that you've completed payment for this project.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not notify admin.",
                variant: 'destructive',
            });
        }
    };

    const handlePrioritize = async () => {
         try {
            await createNotification({
                userId: 'admin',
                message: `${client.name} has requested to prioritize project '${task.projectName}'.`,
                link: `/admin/tasks/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Request Sent!",
                description: "We've sent a request to prioritize this project.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not send prioritization request.",
                variant: 'destructive',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Client Actions</CardTitle>
                <CardDescription>Need something for this project?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button onClick={handleNotify} variant="outline" className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Admin of Payment
                </Button>
                <Button onClick={handlePrioritize} variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Request Prioritization
                </Button>
            </CardContent>
        </Card>
    );
}

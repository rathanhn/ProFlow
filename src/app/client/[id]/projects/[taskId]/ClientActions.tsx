
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/firebase-service';
import { Task, Client, Assignee } from '@/lib/types';
import { Bell, Zap, MessageSquare, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClientActions({ task, client, assignee }: { task: Task; client: Client, assignee: Assignee | null }) {
    const { toast } = useToast();
    const [isMessageDialogOpen, setMessageDialogOpen] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendMessage = async () => {
        if (!message.trim()) {
            toast({ title: "Message is empty", description: "Please write a message before sending.", variant: 'destructive' });
            return;
        }
        try {
            await createNotification({
                userId: 'admin',
                message: `Message from ${client.name} on '${task.projectName}': "${message}"`,
                link: `/admin/tasks/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Message Sent!",
                description: "Your message has been sent to the admin.",
            });
            setMessage('');
            setMessageDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not send your message.",
                variant: 'destructive',
            });
        }
    };
    
    const handleContactOnWhatsApp = () => {
        if (assignee && assignee.mobile) {
            const prefilledMessage = encodeURIComponent(`Hi ${assignee.name}, I have a question about the project: ${task.projectName}.`);
            // The mobile number should be in international format without '+' or '00'
            const whatsappUrl = `https://wa.me/${assignee.mobile.replace(/\D/g, '')}?text=${prefilledMessage}`;
            window.open(whatsappUrl, '_blank');
        } else {
             toast({
                title: "Contact Info Missing",
                description: "The assigned creator's mobile number is not available.",
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
                <Dialog open={isMessageDialogOpen} onOpenChange={setMessageDialogOpen}>
                    <DialogTrigger asChild>
                         <Button variant="outline" className="w-full">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send a Message
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send a message to the Admin</DialogTitle>
                            <DialogDescription>
                                Your message will be sent regarding the project: {task.projectName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                           <Label htmlFor="custom-message" className="sr-only">Your Message</Label>
                           <Textarea 
                                id="custom-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                rows={4}
                           />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSendMessage}>Send Message</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <Button onClick={handleContactOnWhatsApp} variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Creator on WhatsApp
                </Button>

                <Button onClick={handlePrioritize} variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Request Prioritization
                </Button>
            </CardContent>
        </Card>
    );
}

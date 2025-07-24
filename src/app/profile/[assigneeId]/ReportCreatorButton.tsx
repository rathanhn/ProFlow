
'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ReportCreatorButton({ assignee }: { assignee: Assignee }) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [isReportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState('');

    // This component should only be visible to clients.
    // A simple way to check is if the path is not an admin path.
    const isClientView = !pathname.startsWith('/admin');

    const handleReportCreator = async () => {
        if (!reportMessage.trim()) {
            toast({ title: "Message is empty", description: "Please provide a reason for the report.", variant: 'destructive' });
            return;
        }

        try {
            await createNotification({
                userId: 'admin',
                message: `A report has been filed for ${assignee.name}: "${reportMessage}"`,
                link: `/profile/${assignee.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Report Sent",
                description: "Your report has been sent to the admin for review.",
            });
            setReportMessage('');
            setReportDialogOpen(false);
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not send your report.",
                variant: 'destructive',
            });
        }
    };

    if (!isClientView) {
        return null;
    }

    return (
        <Dialog open={isReportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Report Creator to Admin</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report {assignee.name}</DialogTitle>
                    <DialogDescription>
                        Please provide details about the issue. This will be sent to the admin for review.
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4">
                   <Label htmlFor="report-message" className="sr-only">Report Details</Label>
                   <Textarea 
                        id="report-message"
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Type your report here..."
                        rows={4}
                   />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" onClick={handleReportCreator}>Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

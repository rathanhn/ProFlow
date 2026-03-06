
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckSquare, RotateCcw, DollarSign, CreditCard, Camera, Loader2, Share2, Download } from 'lucide-react';
import { updateTask, getClient, createNotification } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import React from 'react';
import PaymentDialog from '@/components/PaymentDialog';
import TicketSnapshotModal from '@/components/TicketSnapshotModal';
import { Client, Task } from '@/lib/types';

export default function AdminActions({ task }: { task: Task }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const [clientData, setClientData] = React.useState<Client | null>(null);
    const [isFetchingClient, setIsFetchingClient] = React.useState(false);

    const handleSendReminder = async () => {
        setIsUpdating(true);
        try {
            await createNotification({
                userId: task.clientId,
                message: `You have a payment reminder for project: ${task.projectName}.`,
                link: `/client/${task.clientId}/projects/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Reminder Sent!",
                description: "A payment reminder has been sent to the client.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not send reminder.",
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkCompleted = async () => {
        setIsUpdating(true);
        try {
            const client = await getClient(task.clientId);
            let paymentDueDate = new Date().toISOString();

            if (client?.paymentTerms) {
                const d = new Date();
                switch (client.paymentTerms) {
                    case 'Net 15': d.setDate(d.getDate() + 15); break;
                    case 'Net 30': d.setDate(d.getDate() + 30); break;
                    case 'Due End of Month':
                        d.setMonth(d.getMonth() + 1);
                        d.setDate(0);
                        break;
                    case 'Due on Receipt': break;
                    case 'Net 5':
                    default: d.setDate(d.getDate() + 5); break;
                }
                paymentDueDate = d.toISOString();
            }

            await updateTask(task.id, {
                workStatus: 'Completed',
                paymentDueDate
            });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#f59e0b', '#3b82f6']
            });

            toast({ title: "Task Completed!" });
            router.refresh();
        } catch (error) {
            console.error('Failed to update task status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUndoCompletion = async () => {
        setIsUpdating(true);
        try {
            await updateTask(task.id, { workStatus: 'In Progress' });
            toast({ title: "Status Reverted", description: "Task is back in progress." });
            router.refresh();
        } catch (error) {
            console.error('Failed to undo completion:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePaymentReceived = async () => {
        setIsUpdating(true);
        try {
            await updateTask(task.id, {
                paymentStatus: 'Paid',
                amountPaid: task.total
            });

            confetti({
                particleCount: 100,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#3b82f6', '#10b981', '#ffffff']
            });

            toast({ title: "Payment Secured!", description: "Full payment recorded." });
            router.refresh();
        } catch (error) {
            console.error('Failed to update payment status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResetPayment = async () => {
        if (!confirm('This will reset the payment status to Unpaid and clear the amount paid. Continue?')) return;
        setIsUpdating(true);
        try {
            await updateTask(task.id, {
                paymentStatus: 'Unpaid',
                amountPaid: 0
            });
            toast({ title: "Payment Reset", description: "Payment status has been cleared." });
            router.refresh();
        } catch (error) {
            console.error('Failed to reset payment:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenShare = async () => {
        if (!clientData) {
            setIsFetchingClient(true);
            try {
                const data = await getClient(task.clientId);
                setClientData(data);
            } catch (error) {
                console.error("Failed to fetch client for share modal:", error);
            } finally {
                setIsFetchingClient(false);
            }
        }
        setIsShareModalOpen(true);
    };

    return (
        <Card className="glass-card border-white/20 dark:border-white/10">
            <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {task.workStatus !== 'Completed' ? (
                    <Button onClick={handleMarkCompleted} disabled={isUpdating} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Mark Completed
                    </Button>
                ) : (
                    <Button onClick={handleUndoCompletion} disabled={isUpdating} variant="outline" className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Revert to In Progress
                    </Button>
                )}

                {task.paymentStatus !== 'Paid' ? (
                    <Button onClick={handlePaymentReceived} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Mark Fully Paid
                    </Button>
                ) : (
                    <Button onClick={() => setIsPaymentDialogOpen(true)} variant="outline" className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Revise Payment Ledger
                    </Button>
                )}

                {task.paymentStatus === 'Paid' && (
                    <Button onClick={handleResetPayment} disabled={isUpdating} variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/5">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Payment Status
                    </Button>
                )}

                <Button onClick={handleSendReminder} disabled={isUpdating || task.paymentStatus === 'Paid'} variant="secondary" className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Send Payment Reminder
                </Button>

                <Button
                    onClick={handleOpenShare}
                    disabled={isFetchingClient}
                    variant="outline"
                    className="w-full border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 active:scale-[0.98] transition-all"
                >
                    {isFetchingClient ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fetching Client Intel...
                        </>
                    ) : (
                        <>
                            <Share2 className="mr-2 h-4 w-4 text-emerald-500" />
                            Distribute Ticket Snapshot
                        </>
                    )}
                </Button>
            </CardContent>

            <TicketSnapshotModal
                task={task}
                client={clientData}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />

            <PaymentDialog
                task={task}
                isOpen={isPaymentDialogOpen}
                onClose={() => {
                    setIsPaymentDialogOpen(false);
                    router.refresh();
                }}
            />
        </Card>
    );
}


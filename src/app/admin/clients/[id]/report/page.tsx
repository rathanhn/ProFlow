import { notFound } from 'next/navigation';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Client, Task } from '@/lib/types';
import ClientReportView from './ClientReportView';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClientReportPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const q = await searchParams;
    const client = await getClient(id);

    if (!client) {
        notFound();
    }

    // Fetch tasks
    let tasks = await getTasksByClientId(id);

    // Filter Logic
    const from = typeof q.from === 'string' ? new Date(q.from) : null;
    const to = typeof q.to === 'string' ? new Date(q.to) : null;
    const statusFilter = typeof q.status === 'string' ? q.status.split(',') : null;
    const paymentStatusFilter = typeof q.paymentStatus === 'string' ? q.paymentStatus.split(',') : null;
    const assigneeFilter = typeof q.assignee === 'string' ? q.assignee : null;

    tasks = tasks.filter(task => {
        // Date Filter (using submissionDate or acceptedDate? usually submissionDate for reports)
        const taskDate = new Date(task.submissionDate);
        if (from && taskDate < from) return false;
        // Set 'to' to end of day if it's exact match? The query param is usually ISO string.
        // Assuming dialog sends ISO string of start/end dates.
        if (to && taskDate > to) return false;

        // Status Filter
        if (statusFilter && !statusFilter.includes(task.workStatus)) return false;

        // Payment Status Filter
        // PaymentStatus in Types is 'Paid' | 'Unpaid' | 'Partial'.
        // If task has no paymentStatus default to Unpaid.
        const pStatus = task.paymentStatus || (task.amountPaid >= task.total ? 'Paid' : task.amountPaid > 0 ? 'Partial' : 'Unpaid');
        // Note: older tasks might not have paymentStatus set explicitly in DB if created before schema update.
        // I should infer it or use what's there. 
        // Logic: if statusFilter includes pStatus.
        if (paymentStatusFilter && !paymentStatusFilter.includes(pStatus)) return false;

        // Assignee Filter
        if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;

        return true;
    });

    // Serialize data to plain objects
    const serializedClient = JSON.parse(JSON.stringify(client)) as Client;
    const serializedTasks = JSON.parse(JSON.stringify(tasks)) as Task[];

    return <ClientReportView client={serializedClient} tasks={serializedTasks} />;
}

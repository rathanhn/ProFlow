import { getTasks } from '@/lib/firebase-service';
import { Task } from '@/lib/types';
import ClientReportView from '../../clients/[id]/report/ClientReportView';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GlobalReportPage({ searchParams }: PageProps) {
    const q = await searchParams;

    // Fetch all tasks
    let tasks = await getTasks();

    // Filter Logic
    const from = typeof q.from === 'string' ? new Date(q.from) : null;
    const to = typeof q.to === 'string' ? new Date(q.to) : null;
    const statusFilter = typeof q.status === 'string' ? q.status.split(',') : null;
    const paymentStatusFilter = typeof q.paymentStatus === 'string' ? q.paymentStatus.split(',') : null;
    const assigneeFilter = typeof q.assignee === 'string' ? q.assignee : null;

    tasks = tasks.filter(task => {
        // Date Filter
        const taskDate = new Date(task.submissionDate);
        if (from && taskDate < from) return false;
        if (to && taskDate > to) return false;

        // Status Filter
        if (statusFilter && !statusFilter.includes(task.workStatus)) return false;

        // Payment Status Filter
        const pStatus = task.paymentStatus || (task.amountPaid >= task.total ? 'Paid' : task.amountPaid > 0 ? 'Partial' : 'Unpaid');
        if (paymentStatusFilter && !paymentStatusFilter.includes(pStatus)) return false;

        // Assignee Filter
        if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;

        return true;
    });

    // Serialize data
    const serializedTasks = JSON.parse(JSON.stringify(tasks)) as Task[];

    return <ClientReportView tasks={serializedTasks} reportTitle="Global Tasks Report" />;
}

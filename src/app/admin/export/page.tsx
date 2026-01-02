
import DashboardLayout from '@/components/DashboardLayout';
import ExportCard from './ExportCard';
import { getTasks, getTransactions } from '@/lib/firebase-service';
import { Task } from '@/lib/types';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminExportPage({ searchParams }: PageProps) {
    const q = await searchParams;
    let rawTasks = await getTasks();
    let rawTransactions = await getTransactions();

    // Filter Logic for Tasks
    const from = typeof q.from === 'string' ? new Date(q.from) : null;
    const to = typeof q.to === 'string' ? new Date(q.to) : null;
    const statusFilter = typeof q.status === 'string' ? q.status.split(',') : null;
    const paymentFilter = typeof q.paymentStatus === 'string' ? q.paymentStatus.split(',') : null;
    const assigneeFilter = typeof q.assignee === 'string' ? q.assignee : null;

    let tasksToExport = rawTasks.filter(task => {
        const date = new Date(task.submissionDate || task.acceptedDate);
        if (from && date < from) return false;
        if (to && date > to) return false;
        if (statusFilter && !statusFilter.includes(task.workStatus)) return false;
        const pStatus = task.paymentStatus || (task.amountPaid >= task.total ? 'Paid' : task.amountPaid > 0 ? 'Partial' : 'Unpaid');
        if (paymentFilter && !paymentFilter.includes(pStatus)) return false;
        if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;
        return true;
    });

    // Filter Logic for Transactions
    let transactionsToExport = rawTransactions.filter(tr => {
        const date = new Date(tr.transactionDate);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
    });

    tasksToExport = JSON.parse(JSON.stringify(tasksToExport));
    transactionsToExport = JSON.parse(JSON.stringify(transactionsToExport));

    // Sort by last modified
    tasksToExport.sort((a: any, b: any) => {
        const timeA = new Date(a.updatedAt || a.acceptedDate).getTime();
        const timeB = new Date(b.updatedAt || b.acceptedDate).getTime();
        return timeB - timeA;
    });

    const isPendingOnly = tasksToExport.length > 0 && tasksToExport.every((t: any) =>
        t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial' ||
        (!t.paymentStatus && t.amountPaid < t.total)
    );

    const dateStr = new Date().toISOString().split('T')[0];
    let taskFilename = isPendingOnly ? `Pending_Payments_Global_${dateStr}.csv` : `Global_Project_Report_${dateStr}.csv`;
    let transFilename = `Global_Transactions_${dateStr}.csv`;

    const formattedTasks = tasksToExport.map((t: any) => ({
        'PRJ#': t.projectNo || 'N/A',
        'PROJECT': t.projectName,
        'CLIENT': t.clientName,
        'STAT': t.workStatus === 'Completed' ? 'DONE' : t.workStatus === 'In Progress' ? 'IP' : 'PEND',
        'PYMT': t.paymentStatus === 'Paid' ? 'PAID' : t.paymentStatus === 'Partial' ? 'PART' : 'UNPD',
        'DATE': new Date(t.submissionDate || t.acceptedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        'PGS': t.pages || 0,
        'RATE': t.rate || 0,
        'BY': t.assigneeName || '-',
        'NOTE': t.notes || '',
        'TOTAL': Number(t.total || 0),
        'PAID': Number(t.amountPaid || 0),
        'BAL': Number(t.total || 0) - Number(t.amountPaid || 0)
    }));

    const formattedTransactions = transactionsToExport.map((tr: any) => ({
        'DATE': new Date(tr.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        'PRJ#': tr.projectNo || 'N/A',
        'PROJECT': tr.projectName,
        'CLIENT': tr.clientName,
        'AMT': tr.amount,
        'METH': tr.paymentMethod,
        'NOTE': tr.notes || ''
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
                    <p className="text-muted-foreground">
                        {tasksToExport.length} tasks and {transactionsToExport.length} transactions match your filters.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <ExportCard
                        title={isPendingOnly ? "Export Pending Payments" : "Export Tasks"}
                        description={isPendingOnly ? "Download CSV of all projects with outstanding balances." : "Download a CSV file of tasks matching your current filters."}
                        buttonLabel="Export CSV"
                        data={formattedTasks}
                        filename={taskFilename}
                    />
                    <ExportCard
                        title="Export Transactions"
                        description="Download a CSV file of financial transactions matching your date range."
                        buttonLabel="Export CSV"
                        data={formattedTransactions}
                        filename={transFilename}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

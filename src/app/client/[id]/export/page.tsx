
import DashboardLayout from '@/components/DashboardLayout';
import { getTasksByClientId, getTransactionsByClientId, getClient } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import ExportCard from '@/app/admin/export/ExportCard';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClientExportPage({ params, searchParams }: PageProps) {
    const { id: clientId } = await params;
    const q = await searchParams;

    if (!clientId) {
        notFound();
    }

    const client = await getClient(clientId);
    const rawTasks = await getTasksByClientId(clientId);
    const rawTransactions = await getTransactionsByClientId(clientId);

    // Filter Logic for Tasks
    const from = typeof q.from === 'string' ? new Date(q.from) : null;
    const to = typeof q.to === 'string' ? new Date(q.to) : null;
    const statusFilter = typeof q.status === 'string' ? q.status.split(',') : null;
    const paymentFilter = typeof q.paymentStatus === 'string' ? q.paymentStatus.split(',') : null;

    let tasksToExport = rawTasks.filter(task => {
        const date = new Date(task.submissionDate || task.acceptedDate);
        if (from && date < from) return false;
        if (to && date > to) return false;
        if (statusFilter && !statusFilter.includes(task.workStatus)) return false;
        const pStatus = task.paymentStatus || (task.amountPaid >= task.total ? 'Paid' : task.amountPaid > 0 ? 'Partial' : 'Unpaid');
        if (paymentFilter && !paymentFilter.includes(pStatus)) return false;
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

    const clientSlug = client?.name.replace(/[^a-z0-9]/gi, '_') || 'Client';
    const dateStr = new Date().toISOString().split('T')[0];
    let taskFilename = isPendingOnly ? `Pending_Payments_${clientSlug}_${dateStr}.csv` : `${clientSlug}_Project_Report_${dateStr}.csv`;
    let transFilename = `${clientSlug}_Transactions_${dateStr}.csv`;

    const formattedTasks = tasksToExport.map((t: any) => ({
        'PRJ#': t.projectNo || 'N/A',
        'PROJECT': t.projectName,
        'STAT': t.workStatus === 'Completed' ? 'DONE' : t.workStatus === 'In Progress' ? 'IP' : 'PEND',
        'PYMT': t.paymentStatus === 'Paid' ? 'PAID' : t.paymentStatus === 'Partial' ? 'PART' : 'UNPD',
        'DATE': new Date(t.submissionDate || t.acceptedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        'PGS': t.pages || 0,
        'RATE': t.rate || 0,
        'NOTE': t.notes || '',
        'TOTAL': Number(t.total || 0),
        'PAID': Number(t.amountPaid || 0),
        'BAL': Number(t.total || 0) - Number(t.amountPaid || 0)
    }));

    const formattedTransactions = transactionsToExport.map((tr: any) => ({
        'DATE': new Date(tr.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        'PRJ#': tr.projectNo || 'N/A',
        'PROJECT': tr.projectName,
        'AMT': tr.amount,
        'METH': tr.paymentMethod,
        'NOTE': tr.notes || ''
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Your Data</h1>
                    <p className="text-muted-foreground">
                        {tasksToExport.length} projects and {transactionsToExport.length} transactions found for this selection.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <ExportCard
                        title={isPendingOnly ? "Export Pending Payments" : "Export Projects"}
                        description={isPendingOnly ? "Download a CSV of your projects with outstanding balances." : "Download a CSV file of all your projects matching current filters."}
                        buttonLabel="Export CSV"
                        data={formattedTasks}
                        filename={taskFilename}
                    />
                    <ExportCard
                        title="Export Transactions"
                        description="Download a CSV file of your payment history matching selection."
                        buttonLabel="Export CSV"
                        data={formattedTransactions}
                        filename={transFilename}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

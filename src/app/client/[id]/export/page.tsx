
import DashboardLayout from '@/components/DashboardLayout';
import { getTasksByClientId, getTransactionsByClientId } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import ExportCard from '@/app/admin/export/ExportCard'; // Reusing the same card component

export default async function ClientExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: clientId } = await params;
    if (!clientId) {
        notFound();
    }

    const rawTasks = await getTasksByClientId(clientId);
    const rawTransactions = await getTransactionsByClientId(clientId);

    const tasksToExport = JSON.parse(JSON.stringify(rawTasks));
    const transactionsToExport = JSON.parse(JSON.stringify(rawTransactions));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Your Data</h1>
                    <p className="text-muted-foreground">Download your project and transaction history in CSV format.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <ExportCard
                        title="Export Your Projects"
                        description="Download a CSV file of all your projects."
                        buttonLabel="Export Projects"
                        data={tasksToExport}
                        filename="my_projects.csv"
                    />
                    <ExportCard
                        title="Export Your Transactions"
                        description="Download a CSV file of your payment history."
                        buttonLabel="Export Transactions"
                        data={transactionsToExport}
                        filename="my_transactions.csv"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

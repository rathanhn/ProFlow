
import DashboardLayout from '@/components/DashboardLayout';
import ExportCard from './ExportCard';
import { getTasks, getTransactions } from '@/lib/firebase-service';

export default async function AdminExportPage() {
    const tasks = await getTasks();
    const transactions = await getTransactions();

    const tasksToExport = JSON.parse(JSON.stringify(tasks));
    const transactionsToExport = JSON.parse(JSON.stringify(transactions));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
                    <p className="text-muted-foreground">Download your data in CSV format.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <ExportCard
                        title="Export All Tasks"
                        description="Download a CSV file of all tasks in the system."
                        buttonLabel="Export Tasks"
                        data={tasksToExport}
                        filename="all_tasks.csv"
                    />
                    <ExportCard
                        title="Export All Transactions"
                        description="Download a CSV file of all financial transactions."
                        buttonLabel="Export Transactions"
                        data={transactionsToExport}
                        filename="all_transactions.csv"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

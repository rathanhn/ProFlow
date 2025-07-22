
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTransactionsByClientId } from '@/lib/firebase-service';
import { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ClientTransactionsPage({ params }: { params: { id: string } }) {
  const clientId = params.id;
  if (!clientId) {
      notFound();
  }

  const rawTransactions = await getTransactionsByClientId(clientId);
  const transactions = JSON.parse(JSON.stringify(rawTransactions)) as Transaction[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Transactions</h1>
          <p className="text-muted-foreground">A complete history of your payments.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Browse through all your recorded transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                         <Link href={`/client/${clientId}/projects/${transaction.taskId}`} className="font-medium hover:underline">
                            {transaction.projectName}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {transactions.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    You have not made any transactions yet.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

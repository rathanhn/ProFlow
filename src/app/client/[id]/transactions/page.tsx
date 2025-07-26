
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
import { type PageProps } from 'next/types';

export default async function ClientTransactionsPage({ params }: PageProps<{ id: string }>) {
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

        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
          {transactions.map((transaction: Transaction) => (
            <Card key={transaction.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="font-semibold">
                            <Link href={`/client/${clientId}/projects/${transaction.taskId}`} className="hover:underline">{transaction.projectName}</Link>
                        </p>
                        <p className="text-sm text-muted-foreground pt-1">
                            {new Date(transaction.transactionDate).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">₹{transaction.amount.toLocaleString()}</p>
                        <Badge variant="outline">{transaction.paymentMethod}</Badge>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
             <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">You have not made any transactions yet.
</p>
                </CardContent>
             </Card>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Browse through all your recorded transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
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
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                              <Link href={`/client/${clientId}/projects/${transaction.taskId}`} className="font-medium hover:underline whitespace-nowrap">
                                  {transaction.projectName}
                              </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            ₹{transaction.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {transactions.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        You have not made any transactions yet.
                    </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

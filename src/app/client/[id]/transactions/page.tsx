
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

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ClientTransactionsPage({ params }: Props) {
  const { id: clientId } = await params;
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
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">
                            <Link href={`/client/${clientId}/projects/${transaction.taskId}`} className="hover:underline">
                              {transaction.projectName}
                            </Link>
                        </p>
                        <p className="text-sm text-muted-foreground pt-1">
                            {new Date(transaction.transactionDate).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                        <p className="font-bold text-lg">₹{transaction.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">{transaction.paymentMethod}</Badge>
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


'use client';

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
import { getTransactions } from '@/lib/firebase-service';
import { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Plus } from 'lucide-react';
import { LongPressMenu } from '@/components/ui/long-press';
import ErrorReportButton from '@/components/ErrorReportButton';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();

  const loadTransactions = async () => {
    try {
      const rawTransactions = await getTransactions();
      setTransactions(JSON.parse(JSON.stringify(rawTransactions)) as Transaction[]);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = async () => {
    haptic.androidSwipeRefresh();
    await loadTransactions();
  };

  const getLongPressActions = (transaction: Transaction) => [
    {
      id: 'view',
      label: 'View Task',
      icon: Eye,
      onClick: () => router.push(`/admin/tasks/${transaction.taskId}`),
    },
    {
      id: 'export',
      label: 'Export Receipt',
      icon: FileText,
      onClick: () => {
        // Export functionality would go here
        haptic.androidClick();
      },
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6 fab-safe-bottom">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
              <p className="text-muted-foreground">A record of all payments received.</p>
            </div>
            <ErrorReportButton
              errorContext={{
                page: 'Transactions',
                component: 'TransactionsPage',
                action: 'View Transactions'
              }}
            />
          </div>

          <Card className="md:hidden glass-card border-white/20 dark:border-white/10">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Browse through all recorded transactions.</CardDescription>
            </CardHeader>
          </Card>

          {/* Mobile View with Long Press */}
          <div className="grid gap-4 md:hidden">
            {transactions.map((transaction: Transaction) => (
              <LongPressMenu key={transaction.id} actions={getLongPressActions(transaction)}>
                <Card className="cursor-pointer overflow-hidden min-w-0 glass-card border-white/20 dark:border-white/10">
                  <CardContent className="p-4 min-w-0">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 min-w-0">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold">
                          <RippleButton
                            variant="ghost"
                            className="p-0 h-auto font-semibold text-left justify-start hover:underline truncate w-full max-w-full"
                            onClick={() => {
                              haptic.androidClick();
                              router.push(`/admin/tasks/${transaction.taskId}`);
                            }}
                          >
                            <span className="truncate block">{transaction.projectName}</span>
                          </RippleButton>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          <span>Client: </span>
                          <RippleButton
                            variant="ghost"
                            className="p-0 h-auto text-sm text-muted-foreground hover:underline ml-1 truncate inline-block max-w-[200px]"
                            onClick={() => {
                              haptic.androidClick();
                              router.push(`/admin/clients/${transaction.clientId}/edit`);
                            }}
                          >
                            <span className="truncate">{transaction.clientName}</span>
                          </RippleButton>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 flex-shrink-0 min-w-0">
                        <p className="font-bold text-lg whitespace-nowrap">₹{transaction.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{transaction.paymentMethod}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LongPressMenu>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block w-full">
            <Card className="glass-card border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Browse through all recorded transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
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
                            <Link href={`/admin/clients/${transaction.clientId}/edit`} className="font-medium hover:underline whitespace-nowrap">
                              {transaction.clientName}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/tasks/${transaction.taskId}`} className="font-medium hover:underline whitespace-nowrap">
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
                    No transactions recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}


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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
            <p className="text-muted-foreground">A record of all payments received.</p>
          </div>

          <Card className="md:hidden">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Browse through all recorded transactions.</CardDescription>
            </CardHeader>
          </Card>

          {/* Mobile View with Long Press */}
          <div className="grid gap-4 md:hidden">
              {transactions.map((transaction: Transaction) => (
                  <LongPressMenu key={transaction.id} actions={getLongPressActions(transaction)}>
                      <Card className="cursor-pointer">
                          <CardContent className="pt-4">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <div className="font-semibold">
                                          <RippleButton
                                            variant="ghost"
                                            className="p-0 h-auto font-semibold text-left justify-start hover:underline"
                                            onClick={() => {
                                              haptic.androidClick();
                                              router.push(`/admin/tasks/${transaction.taskId}`);
                                            }}
                                          >
                                            {transaction.projectName}
                                          </RippleButton>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                          <span>Client: </span>
                                          <RippleButton
                                            variant="ghost"
                                            className="p-0 h-auto text-sm text-muted-foreground hover:underline ml-1"
                                            onClick={() => {
                                              haptic.androidClick();
                                              router.push(`/admin/clients/${transaction.clientId}/edit`);
                                            }}
                                          >
                                            {transaction.clientName}
                                          </RippleButton>
                                      </div>
                                      <div className="text-xs text-muted-foreground pt-1">
                                          {new Date(transaction.transactionDate).toLocaleDateString()}
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-lg">₹{transaction.amount.toLocaleString()}</p>
                                      <Badge variant="outline" className="mt-1">{transaction.paymentMethod}</Badge>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </LongPressMenu>
              ))}
          </div>

        {/* Desktop View */}
        <div className="hidden md:block w-full">
            <Card>
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

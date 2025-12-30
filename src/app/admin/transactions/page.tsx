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
import { useState, useEffect } from 'react';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useRouter } from 'next/navigation';
import {
  Eye,
  FileText,
  Plus,
  Zap,
  Activity,
  Award,
  CreditCard,
  ArrowUpRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INRIcon } from '@/components/ui/inr-icon';
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
        <div className="space-y-8 fab-safe-bottom">
          {/* Premium Hero Section */}
          <div className="relative overflow-hidden rounded-[3rem] bg-emerald-950 p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard className="h-64 w-64 rotate-12" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-black uppercase tracking-[0.2em] text-[10px]">
                    Fiscal Records v2.4
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    Payment <span className="text-emerald-400">Registry</span>
                  </h1>
                  <p className="text-emerald-200/60 font-medium max-w-lg">
                    Comprehensive ledger of all coordination network settlements and financial transmissions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <ErrorReportButton
                    errorContext={{
                      page: 'Transactions',
                      component: 'TransactionsPage',
                    }}
                  />
                  <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Ledger Synced</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">{transactions.length} Records</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="glass-card border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Active Ledger</CardTitle>
                  <CardDescription className="font-medium">Real-time payment verification nodes</CardDescription>
                </div>
                <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] px-3 py-1">
                  Node: PRO-SETTLE-01
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 h-14 pl-8">Trans ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 h-14">Client</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 h-14">Transmission Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 h-14 text-right pr-8">Fiscal Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium italic">
                          No transmissions recorded in this sector.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                          onClick={() => router.push(`/admin/tasks/${transaction.taskId}`)}
                        >
                          <TableCell className="font-mono text-xs text-indigo-400 h-16 pl-8">
                            #{transaction.id.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px]">
                                {transaction.clientName?.charAt(0) || 'P'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{transaction.clientName}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Verified Protocol</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-muted-foreground/80">
                            {new Date(transaction.transactionDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex flex-col items-end">
                              <span className="font-black text-lg tabular-nums flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                                <INRIcon className="h-4 w-4" />
                                {transaction.amount.toLocaleString()}
                              </span>
                              <Badge variant="outline" className="text-[9px] font-black tracking-tighter bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-1 py-0 h-4 uppercase">
                                {transaction.paymentMethod || 'Settled'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}

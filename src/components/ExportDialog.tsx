'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Calendar, Filter } from 'lucide-react';
import { Assignee } from '@/lib/types';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ExportDialogProps {
    baseUrl: string; // e.g., /admin/clients/123/report
    trigger?: React.ReactNode;
    title?: string;
    assignees?: Assignee[];
}

export default function ExportDialog({ baseUrl, trigger, title = "Export Report", assignees = [] }: ExportDialogProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [dateRange, setDateRange] = React.useState('30days');
    const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(['Completed', 'In Progress', 'Pending']);
    const [selectedPaymentStatuses, setSelectedPaymentStatuses] = React.useState<string[]>(['Unpaid', 'Partial', 'Paid']);
    const [selectedAssignee, setSelectedAssignee] = React.useState<string>('all');

    const workStatuses = ['Completed', 'In Progress', 'Pending'];
    const paymentStatuses = ['Paid', 'Unpaid', 'Partial'];

    const handleExport = () => {
        const params = new URLSearchParams();

        // Date Range Logic
        const now = new Date();
        let start: Date | null = null;
        let end: Date = now;

        switch (dateRange) {
            case '15days':
                start = subDays(now, 15);
                break;
            case '30days':
                start = subDays(now, 30);
                break;
            case 'lastMonth':
                start = startOfMonth(subMonths(now, 1));
                end = endOfMonth(subMonths(now, 1));
                break;
            case 'last3months':
                start = subMonths(now, 3);
                break;
            case 'all':
            default:
                start = null;
        }

        if (start) params.set('from', start.toISOString());
        params.set('to', end.toISOString());

        // Statuses
        if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
        if (selectedPaymentStatuses.length > 0) params.set('paymentStatus', selectedPaymentStatuses.join(','));

        // Assignee
        if (selectedAssignee && selectedAssignee !== 'all') params.set('assignee', selectedAssignee);

        router.push(`${baseUrl}?${params.toString()}`);
        setIsOpen(false);
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const togglePaymentStatus = (status: string) => {
        setSelectedPaymentStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Customize your report filters before downloading.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15days">Last 15 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="lastMonth">Last Month</SelectItem>
                                <SelectItem value="last3months">Last 3 Months</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Work Status */}
                    <div className="space-y-2">
                        <Label>Work Status</Label>
                        <div className="flex flex-wrap gap-4">
                            {workStatuses.map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`status-${status}`}
                                        checked={selectedStatuses.includes(status)}
                                        onCheckedChange={() => toggleStatus(status)}
                                    />
                                    <Label htmlFor={`status-${status}`}>{status}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-2">
                        <Label>Payment Status</Label>
                        <div className="flex flex-wrap gap-4">
                            {paymentStatuses.map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`pay-${status}`}
                                        checked={selectedPaymentStatuses.includes(status)}
                                        onCheckedChange={() => togglePaymentStatus(status)}
                                    />
                                    <Label htmlFor={`pay-${status}`}>{status}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assignee - Only show if assignees exist */}
                    {assignees.length > 0 && (
                        <div className="space-y-2">
                            <Label>Filter by Creator</Label>
                            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Creators" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Creators</SelectItem>
                                    {assignees.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                </div>
                <DialogFooter>
                    <Button onClick={handleExport} className="w-full">
                        <Filter className="mr-2 h-4 w-4" /> Generate Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

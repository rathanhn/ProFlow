'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    PlusCircle,
    Mail,
    Edit,
    Trash2,
    Eye,
    Plus,
    UserPlus,
    Phone,
    DollarSign,
    Users,
    ShieldCheck,
    CreditCard,
    Sparkles,
    Search
} from 'lucide-react';
import { getClients, getTasks } from '@/lib/firebase-service';
import { Client, Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import { DeletionDialog } from '@/components/ui/deletion-dialog';
import { ToastProvider } from '@/components/ui/toast-system';
import { useDeletion } from '@/hooks/use-deletion';
import React, { useState, useEffect } from 'react';
import ClientActions from './ClientActions';
import { SwipeActionItem, SwipeAction } from '@/components/ui/swipe-action';
import { LongPressMenu } from '@/components/ui/long-press';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useRouter } from 'next/navigation';
import { MetricCard } from '@/components/ui/charts';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { INRIcon } from '@/components/ui/inr-icon';

function AdminClientsPageContent() {
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletionDialog, setDeletionDialog] = useState<{
        isOpen: boolean;
        client: Client | null;
        deletionData: any;
    }>({
        isOpen: false,
        client: null,
        deletionData: null,
    });

    const haptic = useHapticFeedback();
    const router = useRouter();
    const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();
    const { deleteClient, getClientDeletionData } = useDeletion();

    const loadData = async () => {
        try {
            const [rawClients, rawTasks] = await Promise.all([
                getClients(),
                getTasks()
            ]);
            setClients(JSON.parse(JSON.stringify(rawClients)) as Client[]);
            setTasks(JSON.parse(JSON.stringify(rawTasks)) as Task[]);
        } catch (error) {
            console.error('Failed to load data:', error);
            haptic.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = async () => {
        haptic.androidSwipeRefresh();
        await loadData();
    };

    const handleDeleteClick = async (client: Client) => {
        try {
            haptic.androidClick();
            const deletionData = await getClientDeletionData(client.id);
            setDeletionDialog({
                isOpen: true,
                client,
                deletionData,
            });
        } catch (error) {
            console.error('Failed to get deletion data:', error);
        }
    };

    const handleConfirmDelete = async (options: {
        id: string;
        confirmationText: string;
    }) => {
        await deleteClient(options);
        setDeletionDialog({ isOpen: false, client: null, deletionData: null });
        await loadData();
    };

    const closeDeletionDialog = () => {
        setDeletionDialog({ isOpen: false, client: null, deletionData: null });
    };

    const handleDeleteClient = async (clientId: string) => {
        try {
            haptic.androidClick();
            await deleteClient({
                id: clientId,
                confirmationText: 'Confirmed via alert'
            });
            setClients(prev => prev.filter(client => client.id !== clientId));
            haptic.success();
        } catch (error) {
            console.error('Failed to delete client:', error);
            haptic.error();
        }
    };

    const getSwipeActions = (client: Client): SwipeAction[] => [
        {
            id: 'view',
            label: 'View',
            icon: Eye,
            color: 'primary',
            onAction: () => {
                router.push(`/admin/clients/${client.id}`);
            },
        },
        {
            id: 'edit',
            label: 'Edit',
            icon: Edit,
            color: 'secondary',
            onAction: () => {
                router.push(`/admin/clients/${client.id}/edit`);
            },
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: Trash2,
            color: 'destructive',
            onAction: () => {
                if (confirm('Are you sure you want to delete this client?')) {
                    handleDeleteClient(client.id);
                }
            },
        },
    ];

    const getLongPressActions = (client: Client) => [
        {
            id: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => router.push(`/admin/clients/${client.id}`),
        },
        {
            id: 'edit',
            label: 'Edit Client',
            icon: Edit,
            onClick: () => router.push(`/admin/clients/${client.id}/edit`),
        },
        {
            id: 'delete',
            label: 'Delete Client',
            icon: Trash2,
            onClick: () => {
                if (confirm('Are you sure you want to delete this client?')) {
                    handleDeleteClient(client.id);
                }
            },
            variant: 'destructive' as const,
        },
    ];

    const fabActions = [
        {
            id: 'new-client',
            label: 'New Client',
            icon: UserPlus,
            onClick: () => {
                haptic.androidClick();
                router.push('/admin/clients/new');
            },
        },
    ];

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRevenue = tasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, t) => acc + (t.total || 0), 0);
    const pendingRevenue = tasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, t) => acc + ((t.total || 0) - (t.amountPaid || 0)), 0);

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
                <div className="space-y-8 fab-safe-bottom pt-4">
                    {/* Premium Hero Section */}
                    <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 md:p-12 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-8">
                            <div className="space-y-3 md:space-y-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                                        <Users className="h-5 w-5 md:h-7 md:w-7 text-blue-200" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/80 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                                                CRM Protocol
                                            </span>
                                            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[8px] md:text-[10px] uppercase font-bold px-2 py-0 h-4">
                                                Elite Network
                                            </Badge>
                                        </div>
                                        <h1 className="text-2xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                                            Partner Ecosystem
                                        </h1>
                                    </div>
                                </div>
                                <p className="hidden sm:block opacity-70 text-sm leading-relaxed border-l-2 border-white/20 pl-4 py-1 max-w-xl italic">
                                    Managing global partnerships and strategic client relations with precision and intelligence.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row xl:flex-col gap-2 md:gap-3 min-w-0 sm:min-w-[300px] xl:min-w-[200px]">
                                <Button className="h-10 md:h-12 bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transition-transform font-black shadow-xl shadow-blue-900/10 text-sm md:text-base px-4 rounded-xl md:rounded-2xl" onClick={() => router.push('/admin/clients/new')}>
                                    <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Onboard Partner
                                </Button>
                                <div className="relative group">
                                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                                    <Input
                                        placeholder="Scan ecosystem..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 md:h-12 pl-10 md:pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl md:rounded-2xl backdrop-blur-xl focus:bg-white/20 transition-all border-none text-sm md:text-base"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Partners"
                            value={clients.length}
                            icon={<ShieldCheck className="h-6 w-6 text-blue-500" />}
                            className="glass-card border-blue-500/20 shadow-blue-500/5"
                        />
                        <MetricCard
                            title="Ecosystem Value"
                            value={`₹${totalRevenue.toLocaleString()}`}
                            icon={<INRIcon className="h-6 w-6 text-emerald-500" />}
                            className="glass-card border-emerald-500/20 shadow-emerald-500/5"
                        />
                        <MetricCard
                            title="Pending Settlement"
                            value={`₹${pendingRevenue.toLocaleString()}`}
                            icon={<CreditCard className="h-6 w-6 text-amber-500" />}
                            className="glass-card border-amber-500/20 shadow-amber-500/5"
                        />
                        <MetricCard
                            title="Active Projects"
                            value={tasks.filter(t => t.workStatus !== 'Completed').length}
                            icon={<Sparkles className="h-6 w-6 text-violet-500" />}
                            className="glass-card border-violet-500/20 shadow-violet-500/5"
                        />
                    </div>

                    <Card className="glass-card border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" /> Administrative Directory
                                    </CardTitle>
                                    <CardDescription>Verified list of global partners and agency contacts.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Mobile View */}
                            <div className="grid gap-4 md:hidden p-4">
                                {filteredClients.map((client) => (
                                    <SwipeActionItem
                                        key={client.id}
                                        rightActions={getSwipeActions(client)}
                                        className="rounded-3xl overflow-hidden"
                                    >
                                        <LongPressMenu actions={getLongPressActions(client)}>
                                            <div
                                                className="p-4 bg-white/5 border border-white/10 rounded-3xl cursor-pointer hover:bg-white/10 transition-all"
                                                onClick={() => {
                                                    haptic.androidClick();
                                                    router.push(`/admin/clients/${client.id}`);
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar
                                                        className="h-14 w-14 ring-2 ring-white/10 shadow-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const imageUrl = client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
                                                            openViewer(imageUrl, client.name, client.email);
                                                        }}
                                                    >
                                                        <AvatarImage src={client.avatar} alt="Avatar" />
                                                        <AvatarFallback className="bg-blue-500 text-white font-black">{client.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-sm uppercase tracking-tight truncate">{client.name}</h4>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                                                            <Mail className="h-3 w-3" /> {client.email}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] uppercase">
                                                                {client.phone || 'NO PHONE'}
                                                            </Badge>
                                                            {client.defaultRate && (
                                                                <span className="text-[10px] font-black text-emerald-600 uppercase">₹{client.defaultRate}/PG</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                    <ClientActions client={client} action="copy" />
                                                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-blue-500">
                                                        Protocol Access <Eye className="ml-1.5 h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </LongPressMenu>
                                    </SwipeActionItem>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-secondary/30">
                                        <TableRow className="hover:bg-transparent border-white/10">
                                            <TableHead className="pl-8 font-black text-[10px] uppercase tracking-widest">Partner Identity</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Communication Channel</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Standard Rate</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Access Node</TableHead>
                                            <TableHead className="pr-8 text-right font-black text-[10px] uppercase tracking-widest">Operations</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredClients.map((client) => (
                                            <TableRow
                                                key={client.id}
                                                className="group cursor-pointer hover:bg-blue-500/[0.02] border-white/10 transition-colors"
                                                onClick={() => {
                                                    haptic.androidClick();
                                                    router.push(`/admin/clients/${client.id}`);
                                                }}
                                            >
                                                <TableCell className="pl-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar
                                                            className="h-12 w-12 ring-2 ring-white/5 shadow-md group-hover:ring-blue-500/20 transition-all duration-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const imageUrl = client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
                                                                openViewer(imageUrl, client.name, client.email);
                                                            }}
                                                        >
                                                            <AvatarImage src={client.avatar} alt="Avatar" />
                                                            <AvatarFallback className="bg-blue-100 text-blue-800 font-bold">{client.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{client.name}</p>
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 mt-1 border-blue-500/10 text-blue-500/60 font-black">ID: {client.id.slice(0, 8)}</Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                            <Mail className="h-3 w-3 text-blue-500" /> {client.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                            <Phone className="h-3 w-3 text-indigo-500" /> {client.phone || 'NO TELEMETRY'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {client.defaultRate ? (
                                                        <span className="font-black text-sm text-emerald-600">₹{client.defaultRate} <span className="text-[10px] text-muted-foreground font-medium">/ PG</span></span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase italic tracking-widest">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <ClientActions client={client} action="copy" />
                                                </TableCell>
                                                <TableCell className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-blue-500/10 transition-colors">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-white/20 glass-card">
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}`)} className="rounded-xl font-bold text-xs uppercase tracking-tight">
                                                                <Eye className="mr-2.5 h-4 w-4 text-blue-500" /> View Protocol
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}/edit`)} className="rounded-xl font-bold text-xs uppercase tracking-tight">
                                                                <Edit className="mr-2.5 h-4 w-4 text-indigo-500" /> Reconfigure
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-white/10" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(client)}
                                                                className="rounded-xl font-bold text-xs uppercase tracking-tight text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            >
                                                                <Trash2 className="mr-2.5 h-4 w-4" /> Purge Entry
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PullToRefresh>

            {/* Floating Action Button */}
            <FloatingActionButton
                actions={fabActions}
                position="bottom-right"
                size="default"
            />

            {/* Profile Image Viewer */}
            <ProfileImageViewer
                isOpen={isOpen}
                onClose={closeViewer}
                imageUrl={imageData.imageUrl}
                userName={imageData.userName}
                userEmail={imageData.userEmail}
            />

            {/* Deletion Dialog */}
            <DeletionDialog
                isOpen={deletionDialog.isOpen}
                onClose={closeDeletionDialog}
                type="client"
                data={{
                    id: deletionDialog.client?.id || '',
                    name: deletionDialog.client?.name || '',
                    email: deletionDialog.client?.email,
                    tasksCount: deletionDialog.deletionData?.tasksCount || 0,
                    transactionsCount: deletionDialog.deletionData?.transactionsCount || 0,
                }}
                onConfirmDelete={handleConfirmDelete}
            />
        </DashboardLayout>
    );
}

export default function AdminClientsPage() {
    return (
        <ToastProvider position="top-right">
            <AdminClientsPageContent />
        </ToastProvider>
    );
}

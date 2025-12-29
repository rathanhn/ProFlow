import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Download,
    User,
    Calendar,
    Hash,
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    IndianRupee,
    AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'In Progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case 'Pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        case 'Paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'Partial': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case 'Unpaid': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
        default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
};

const DetailItem = ({ icon: Icon, label, value, className }: { icon: any; label: string; value: React.ReactNode; className?: string }) => (
    <div className={cn("flex items-center justify-between py-4 group hover:bg-white/5 transition-colors px-2 rounded-xl", className)}>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/50 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Icon className="h-4 w-4" />
            </div>
            <dt className="text-xs uppercase font-black tracking-widest text-muted-foreground">{label}</dt>
        </div>
        <dd className="text-sm font-bold">{value}</dd>
    </div>
);

export default function TaskDetails({ task }: { task: Task }) {
    const remaining = task.total - task.amountPaid;

    return (
        <div className="space-y-8">
            {/* Top Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Project ID</p>
                    <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <p className="text-lg font-black font-mono">{task.projectNo || 'N/A'}</p>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Work Status</p>
                    <Badge className={cn(getStatusColor(task.workStatus), "border px-2 py-0 text-[10px] uppercase font-black")}>
                        {task.workStatus}
                    </Badge>
                </div>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Scale</p>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <p className="text-lg font-black">{task.pages} <span className="text-xs text-muted-foreground font-medium">Pages</span></p>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Payment</p>
                    <Badge className={cn(getStatusColor(task.paymentStatus), "border px-2 py-0 text-[10px] uppercase font-black")}>
                        {task.paymentStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <h3 className="text-xs uppercase font-black tracking-tighter text-muted-foreground ml-2 mb-2">Collaboration Intelligence</h3>
                    <div className="glass-card rounded-2xl p-2 border-white/5 shadow-inner">
                        <DetailItem icon={User} label="Client Partner" value={task.clientName} />
                        <DetailItem
                            icon={Briefcase}
                            label="Assigned Expert"
                            value={task.assigneeName || <span className="text-muted-foreground font-medium">Unassigned</span>}
                        />
                        <DetailItem
                            icon={Calendar}
                            label="Kickoff"
                            value={new Date(task.acceptedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        />
                        <DetailItem
                            icon={Clock}
                            label="Deadline"
                            value={
                                <span className={cn(
                                    new Date(task.submissionDate) < new Date() && task.workStatus !== 'Completed' ? "text-rose-500" : "text-primary"
                                )}>
                                    {new Date(task.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            }
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs uppercase font-black tracking-tighter text-muted-foreground ml-2 mb-2">Financial Breakdown</h3>
                    <div className="glass-card rounded-2xl p-2 border-white/5 shadow-inner">
                        <DetailItem icon={IndianRupee} label="Unit Rate" value={`₹${task.rate.toLocaleString()}`} />
                        <DetailItem icon={CheckCircle2} label="Contract Value" value={<span className="text-lg text-gradient-indigo">₹{task.total.toLocaleString()}</span>} />
                        <DetailItem icon={IndianRupee} label="Settled Amount" value={<span className="text-emerald-500">₹{task.amountPaid.toLocaleString()}</span>} />
                        <div className="relative mt-2 p-3 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl border-l-4 border-rose-500">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-rose-500" />
                                    <p className="text-[10px] uppercase font-black text-rose-500 tracking-widest">Outstanding</p>
                                </div>
                                <p className="text-xl font-black text-rose-600">₹{remaining.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {task.notes && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs uppercase font-black tracking-tighter text-muted-foreground">Strategic Notes</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground p-5 bg-secondary/30 rounded-2xl border border-white/5 italic">
                        "{task.notes}"
                    </p>
                </div>
            )}

            {(task.projectFileLink || task.outputFileLink) && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs uppercase font-black tracking-tighter text-muted-foreground">Digital Assets</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {task.projectFileLink && (
                            <Button variant="outline" asChild className="h-12 rounded-xl group overflow-hidden relative border-white/10 hover:border-primary/50 transition-all">
                                <a href={task.projectFileLink} target="_blank" rel="noopener noreferrer">
                                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <Download className="mr-2 h-4 w-4 text-primary" />
                                    <span className="relative z-10">Download Brief</span>
                                </a>
                            </Button>
                        )}
                        {task.outputFileLink && (
                            <Button asChild className="h-12 rounded-xl glow-blue active:scale-[0.98] border-none">
                                <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Deliverable
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

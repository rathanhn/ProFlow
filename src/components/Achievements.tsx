'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Trophy,
    Medal,
    Award,
    Star,
    Crown,
    Flame,
    Zap,
    ShieldCheck,
    Target,
    Sparkles,
    Gem,
    CheckCircle2,
    Lock,
    X,
    TrendingUp,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { ModernPopup } from '@/components/ui/modern-popup';
import confetti from 'canvas-confetti';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    threshold: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

export const TASK_ACHIEVEMENTS: Achievement[] = [
    {
        id: 't1',
        title: 'Initiator',
        description: 'Complete 1 project to unlock the Initiator rank.',
        longDescription: 'The first step into a larger world. This badge signifies your official entry into our operational pipeline. You have successfully navigated your first project from conception to completion.',
        threshold: 1,
        icon: Zap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 't5',
        title: 'Consistent',
        description: 'Complete 5 projects to achieve consistency status.',
        longDescription: 'Reliability is the cornerstone of professional success. By completing 5 projects, you have demonstrated a steady rhythm and the ability to maintain quality across multiple deliveries.',
        threshold: 5,
        icon: Target,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 't10',
        title: 'Hard Worker',
        description: 'Reach 10 completed projects milestone.',
        longDescription: 'Pure grit and determination. Reaching double digits in project completions places you among the most dedicated members of our network.',
        threshold: 10,
        icon: Flame,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 't20',
        title: 'Specialist',
        description: 'Unlock this after 20 successful missions.',
        longDescription: 'You are no longer just a participant; you are a specialist. Your deep understanding of the workflow allows you to handle complex missions with surgical precision.',
        threshold: 20,
        icon: Medal,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 't30',
        title: 'Veteran',
        description: 'Proven mastery over 30 completed projects.',
        longDescription: 'Battle-tested and highly experienced. You have seen it all and handled it with grace. A Veteran is a beacon of stability in the creative storm.',
        threshold: 30,
        icon: ShieldCheck,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10'
    },
    {
        id: 't50',
        title: 'Elite',
        description: 'A distinguished rank for 50 project completions.',
        longDescription: 'Only the top tier of our network reaches this level of output. You are an Elite operator, defining the standard for everyone else to follow.',
        threshold: 50,
        icon: Award,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 't100',
        title: 'Legendary',
        description: 'The pinnacle of productivity at 100 projects.',
        longDescription: 'Your name is whispered in the corridors of progress. 100 projects signify a monumental contribution to the collective creative force.',
        threshold: 100,
        icon: Trophy,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10'
    },
    {
        id: 't150',
        title: 'Mythic',
        description: 'Ultimate coordination mastery beyond 150 projects.',
        longDescription: 'You have ascended beyond standard metrics. A Mythic operator is a force of nature, orchestrating vast arrays of creative data with ease.',
        threshold: 150,
        icon: Crown,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
];

export const MONEY_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'm50',
        title: 'Seed',
        description: 'Accumulate ₹50 in total volume.',
        longDescription: 'The first financial spark. This badge marks the beginning of your fiscal journey within our ecosystem.',
        threshold: 50,
        icon: Star,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10'
    },
    {
        id: 'm100',
        title: 'Sprout',
        description: 'Reach ₹100 in financial movement.',
        longDescription: 'Your economic influence is growing. Reaching the triple-digit milestone shows significant upward momentum.',
        threshold: 100,
        icon: Sparkles,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-400/10'
    },
    {
        id: 'm200',
        title: 'Bloom',
        description: 'Unlock after ₹200 total settlement.',
        longDescription: 'A flourishing financial status. You are becoming a key player in our ecosystem\'s trade and production cycles.',
        threshold: 200,
        icon: Gem,
        color: 'text-violet-400',
        bgColor: 'bg-violet-400/10'
    },
    {
        id: 'm300',
        title: 'Harvest',
        description: 'Strong financial rhythm at ₹300.',
        longDescription: 'Gathering the fruits of your labor. Your financial engagement has reached a level of substantial maturity.',
        threshold: 300,
        icon: Flame,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'm500',
        title: 'Prosperity',
        description: 'Total value reaching ₹500.',
        longDescription: 'You are an architect of wealth. Reaching ₹500 in total volume signifies a deep and prosperous relationship with our platform.',
        threshold: 500,
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'm1000',
        title: 'Titan',
        description: 'Dominate the economy with ₹1,000.',
        longDescription: 'A True Titan of industry. Your fiscal volume commands respect and defines the upper echelons of our network\'s financial power.',
        threshold: 1000,
        icon: Award,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'm1500',
        title: 'Monarch',
        description: 'Unrivaled influence at ₹1,500.',
        longDescription: 'The ultimate fiscal authority. Your financial footprint is large enough to shape the very nature of our collaborative environment.',
        threshold: 1500,
        icon: Crown,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
];

interface AchievementsProps {
    taskCount: number;
    moneyValue: number;
    type: 'client' | 'creator';
    showTitle?: boolean;
}

export default function Achievements({ taskCount, moneyValue, type, showTitle = true }: AchievementsProps) {
    const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const currentTaskAchievement = [...TASK_ACHIEVEMENTS].reverse().find(a => taskCount >= a.threshold);
    const currentMoneyAchievement = [...MONEY_ACHIEVEMENTS].reverse().find(a => moneyValue >= a.threshold);

    const nextTaskAchievement = TASK_ACHIEVEMENTS.find(a => taskCount < a.threshold);
    const nextMoneyAchievement = MONEY_ACHIEVEMENTS.find(a => moneyValue < a.threshold);

    const moneyLabel = type === 'client' ? 'Total Investment' : 'Total Earnings';

    const handleBadgeClick = (badge: Achievement, isUnlocked: boolean) => {
        setSelectedBadge(badge);
        setIsPopupOpen(true);

        if (isUnlocked) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
                ticks: 300,
                zIndex: 60 // Sharp z-index
            });
        }
    };

    return (
        <>
            <Card className="glass-card border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
                {showTitle && (
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-yellow-500" /> Professional Status
                                </CardTitle>
                                <CardDescription>Unlocking milestones based on performance telemetry.</CardDescription>
                            </div>
                            <Badge variant="outline" className="border-blue-500/20 text-blue-500 font-black uppercase tracking-widest text-[10px]">
                                Rank System v1.0
                            </Badge>
                        </div>
                    </CardHeader>
                )}
                <CardContent className={cn("space-y-6", showTitle ? "pt-4" : "p-6")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mission Progress */}
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mission Mastery</span>
                                <span className="text-[10px] font-black uppercase text-blue-500">{taskCount} COMPLETED</span>
                            </div>

                            {currentTaskAchievement ? (
                                <div
                                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-2xl transition-all"
                                    onClick={() => handleBadgeClick(currentTaskAchievement, true)}
                                >
                                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shrink-0", currentTaskAchievement.bgColor)}>
                                        <currentTaskAchievement.icon className={cn("h-8 w-8 shadow-glow", currentTaskAchievement.color)} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm uppercase tracking-tight truncate">{currentTaskAchievement.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1 italic">{currentTaskAchievement.description}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 opacity-50">
                                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center shrink-0">
                                        <Target className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tight">Initiating...</h4>
                                        <p className="text-xs text-muted-foreground font-medium italic">Complete your first mission</p>
                                    </div>
                                </div>
                            )}

                            {nextTaskAchievement && (
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        <span>Next: {nextTaskAchievement.title}</span>
                                        <span>{taskCount}/{nextTaskAchievement.threshold}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${(taskCount / nextTaskAchievement.threshold) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Financial Progress */}
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{moneyLabel}</span>
                                <span className="text-[10px] font-black uppercase text-emerald-500">₹{moneyValue.toLocaleString()} UNLOCKED</span>
                            </div>

                            {currentMoneyAchievement ? (
                                <div
                                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-2xl transition-all"
                                    onClick={() => handleBadgeClick(currentMoneyAchievement, true)}
                                >
                                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shrink-0", currentMoneyAchievement.bgColor)}>
                                        <currentMoneyAchievement.icon className={cn("h-8 w-8 shadow-glow", currentMoneyAchievement.color)} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm uppercase tracking-tight truncate">{currentMoneyAchievement.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1 italic">{currentMoneyAchievement.description}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 opacity-50">
                                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center shrink-0">
                                        <Gem className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tight">Financial Phase 0</h4>
                                        <p className="text-xs text-muted-foreground font-medium italic">Unlock status with first settlement</p>
                                    </div>
                                </div>
                            )}

                            {nextMoneyAchievement && (
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        <span>Next: {nextMoneyAchievement.title}</span>
                                        <span>₹{moneyValue.toLocaleString()}/₹{nextMoneyAchievement.threshold.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-1000"
                                            style={{ width: `${(moneyValue / nextMoneyAchievement.threshold) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badge Scrollbox */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/40 pt-2">All Attainable Designations</p>
                        <div className="flex items-center justify-start gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                            {TASK_ACHIEVEMENTS.map((a) => {
                                const unlocked = taskCount >= a.threshold;
                                return (
                                    <div
                                        key={a.id}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 min-w-[100px] transition-all duration-500 cursor-pointer",
                                            unlocked ? "grayscale-0 scale-110" : "grayscale opacity-40 hover:opacity-100"
                                        )}
                                        onClick={() => handleBadgeClick(a, unlocked)}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500 relative",
                                            unlocked ? cn(a.bgColor, "border-white/10 shadow-lg") : "bg-white/5 border-white/5"
                                        )}>
                                            {!unlocked && <Lock className="absolute -top-1 -right-1 h-3 w-3 text-muted-foreground/50" />}
                                            <a.icon className={cn("h-6 w-6", unlocked ? a.color : "text-muted-foreground")} />
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-wider text-center",
                                            unlocked ? "text-foreground" : "text-muted-foreground/30"
                                        )}>{a.title}</span>
                                    </div>
                                );
                            })}
                            {MONEY_ACHIEVEMENTS.map((a) => {
                                const unlocked = moneyValue >= a.threshold;
                                return (
                                    <div
                                        key={a.id}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 min-w-[100px] transition-all duration-500 cursor-pointer",
                                            unlocked ? "grayscale-0 scale-110" : "grayscale opacity-40 hover:opacity-100"
                                        )}
                                        onClick={() => handleBadgeClick(a, unlocked)}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500 relative",
                                            unlocked ? cn(a.bgColor, "border-white/10 shadow-lg") : "bg-white/5 border-white/5"
                                        )}>
                                            {!unlocked && <Lock className="absolute -top-1 -right-1 h-3 w-3 text-muted-foreground/50" />}
                                            <a.icon className={cn("h-6 w-6", unlocked ? a.color : "text-muted-foreground")} />
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-wider text-center",
                                            unlocked ? "text-foreground" : "text-muted-foreground/30"
                                        )}>{a.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <BadgePopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                badge={selectedBadge}
                currentValue={selectedBadge?.id.startsWith('t') ? taskCount : moneyValue}
            />
        </>
    );
}

function BadgePopup({ isOpen, onClose, badge, currentValue }: { isOpen: boolean, onClose: () => void, badge: Achievement | null, currentValue: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen && currentValue >= (badge?.threshold || 0) && canvasRef.current) {
            const myConfetti = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true
            });

            // Fire multiple bursts
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen, badge, currentValue]);

    if (!badge) return null;

    const isUnlocked = currentValue >= badge.threshold;
    const isMoney = badge.id.startsWith('m');
    const unit = isMoney ? '₹' : '';
    const label = isMoney ? 'Value' : 'Projects';

    return (
        <ModernPopup
            isOpen={isOpen}
            onClose={onClose}
            style="glass"
            size="md"
            className="rounded-[3rem] overflow-hidden border-white/20 p-0"
            showCloseButton={false}
        >
            <div className="relative group overflow-hidden">
                {/* Internal Confetti Canvas - Sharp and inside the card */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
                />

                <div className="p-8 space-y-8 relative z-10">
                    {/* Header Graphic */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn(
                            "h-32 w-32 rounded-[2.5rem] flex items-center justify-center border shadow-2xl relative",
                            isUnlocked ? cn(badge.bgColor, "border-white/40") : "bg-white/5 border-dashed border-white/10 grayscale"
                        )}>
                            {isUnlocked && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full ring-8 ring-emerald-500/10">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            )}
                            {!isUnlocked && <Lock className="absolute -top-2 -right-2 text-muted-foreground/40 h-8 w-8" />}
                            <badge.icon className={cn("h-16 w-16", isUnlocked ? badge.color : "text-muted-foreground/20")} />
                        </div>

                        <div>
                            <Badge variant="outline" className={cn(
                                "uppercase tracking-[0.3em] font-black text-[10px] mb-2 px-3",
                                isUnlocked ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-muted-foreground/40"
                            )}>
                                {isUnlocked ? 'Protocol Verified' : 'Locked Entry'}
                            </Badge>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">{badge.title}</h2>
                        </div>
                    </div>

                    {/* Lore/Detail */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-inner">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Dossier</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-white/70">
                            {badge.longDescription || badge.description}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Required</span>
                            <p className="text-xl font-black tabular-nums text-white">{unit}{badge.threshold.toLocaleString()}</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase">{label}</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Current</span>
                            <p className={cn("text-xl font-black tabular-nums", isUnlocked ? "text-emerald-400" : "text-blue-400")}>
                                {unit}{currentValue.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40 font-bold uppercase">Progress</p>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] border border-white/10 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
                        >
                            Close Registry Dossier <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        </button>
                        {isUnlocked && (
                            <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mt-4 animate-pulse">
                                Security Clearances Updated
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </ModernPopup>
    );
}

export function AchievementGallery({ taskCount, moneyValue, type }: AchievementsProps) {
    const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleBadgeClick = (badge: Achievement, isUnlocked: boolean) => {
        setSelectedBadge(badge);
        setIsPopupOpen(true);

        if (isUnlocked) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
                ticks: 300,
                zIndex: 40 // Behind the popup (z-50)
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Detailed Missions List */}
                <Card className="glass-card border-white/20 shadow-xl rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-blue-500" /> Mission Milestones
                        </CardTitle>
                        <CardDescription>Badges earned through total project completions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {TASK_ACHIEVEMENTS.map((a) => {
                            const unlocked = taskCount >= a.threshold;
                            const progress = Math.min(100, (taskCount / a.threshold) * 100);
                            return (
                                <div
                                    key={a.id}
                                    className={cn(
                                        "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group cursor-pointer",
                                        unlocked ? "bg-white/10 border-white/20 shadow-xl hover:bg-white/20" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                                    )}
                                    onClick={() => handleBadgeClick(a, unlocked)}
                                >
                                    {unlocked && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-full ring-4 ring-emerald-500/10">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-5">
                                        <div className={cn(
                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110",
                                            unlocked ? cn(a.bgColor, "border-white/20 shadow-lg") : "bg-secondary/50 border-white/5"
                                        )}>
                                            <a.icon className={cn("h-8 w-8", unlocked ? a.color : "text-muted-foreground/40")} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-lg uppercase tracking-tight">{a.title}</h3>
                                                {!unlocked && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                                                {a.description}
                                            </p>

                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Objective</span>
                                                        <p className="text-[11px] font-bold uppercase">{a.threshold} PROJECTS COMPLETED</p>
                                                    </div>
                                                    <Badge variant={unlocked ? 'default' : 'outline'} className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest h-5 px-2",
                                                        unlocked ? "bg-blue-600 hover:bg-blue-700" : "text-muted-foreground/40"
                                                    )}>
                                                        {unlocked ? 'CLAIMED' : `${taskCount} / ${a.threshold}`}
                                                    </Badge>
                                                </div>
                                                {!unlocked && (
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all duration-1000"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Detailed Financial List */}
                <Card className="glass-card border-white/20 shadow-xl rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gem className="h-5 w-5 text-emerald-500" /> Fiscal Designations
                        </CardTitle>
                        <CardDescription>Badges earned through lifetime financial volume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {MONEY_ACHIEVEMENTS.map((a) => {
                            const unlocked = moneyValue >= a.threshold;
                            const progress = Math.min(100, (moneyValue / a.threshold) * 100);
                            return (
                                <div
                                    key={a.id}
                                    className={cn(
                                        "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group cursor-pointer",
                                        unlocked ? "bg-white/10 border-white/20 shadow-xl hover:bg-white/20" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                                    )}
                                    onClick={() => handleBadgeClick(a, unlocked)}
                                >
                                    {unlocked && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-full ring-4 ring-emerald-500/10">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-5">
                                        <div className={cn(
                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110",
                                            unlocked ? cn(a.bgColor, "border-white/20 shadow-lg") : "bg-secondary/50 border-white/5"
                                        )}>
                                            <a.icon className={cn("h-8 w-8", unlocked ? a.color : "text-muted-foreground/40")} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-lg uppercase tracking-tight">{a.title}</h3>
                                                {!unlocked && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                                                {a.description}
                                            </p>

                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Fiscal Goal</span>
                                                        <p className="text-[11px] font-bold uppercase">₹{a.threshold.toLocaleString()}</p>
                                                    </div>
                                                    <Badge variant={unlocked ? 'default' : 'outline'} className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest h-5 px-2",
                                                        unlocked ? "bg-emerald-600 hover:bg-emerald-700" : "text-muted-foreground/40"
                                                    )}>
                                                        {unlocked ? 'CLAIMED' : `₹${moneyValue.toLocaleString()} / ₹${a.threshold.toLocaleString()}`}
                                                    </Badge>
                                                </div>
                                                {!unlocked && (
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-1000"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <BadgePopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                badge={selectedBadge}
                currentValue={selectedBadge?.id.startsWith('t') ? taskCount : moneyValue}
            />
        </div>
    );
}

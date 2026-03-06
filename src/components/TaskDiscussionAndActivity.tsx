'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TaskComment, TaskActivity } from '@/lib/types';
import { getTaskComments, addTaskComment, getTaskActivity } from '@/lib/firebase-service';
import { MessageSquare, Activity, Send, Clock, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TaskDiscussionAndActivityProps {
    taskId: string;
    currentUser: {
        id: string;
        name: string;
        type: 'admin' | 'client' | 'creator';
    };
}

export default function TaskDiscussionAndActivity({ taskId, currentUser }: TaskDiscussionAndActivityProps) {
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, [taskId, activeTab]);

    useEffect(() => {
        if (activeTab === 'comments' && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments, activeTab]);

    const loadData = async () => {
        if (activeTab === 'comments') {
            const data = await getTaskComments(taskId);
            setComments(data);
        } else {
            const data = await getTaskActivity(taskId);
            setActivities(data);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await addTaskComment({
                taskId,
                userId: currentUser.id,
                userName: currentUser.name,
                userType: currentUser.type,
                content: newComment.trim(),
                createdAt: new Date().toISOString()
            });
            setNewComment('');
            await loadData();
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'admin': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'client': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'creator': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'system': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    return (
        <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem] flex flex-col h-[500px]">
            <div className="flex border-b border-border/10">
                <button
                    onClick={() => setActiveTab('comments')}
                    className={cn(
                        "flex-1 py-4 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-colors",
                        activeTab === 'comments' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/20"
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    Discussion
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                        "flex-1 py-4 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-colors",
                        activeTab === 'activity' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/20"
                    )}
                >
                    <Activity className="h-4 w-4" />
                    Activity Log
                </button>
            </div>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {activeTab === 'comments' ? (
                        comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-medium text-sm">No comments yet. Start the conversation!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className={cn(
                                    "flex gap-4",
                                    comment.userId === currentUser.id ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <Avatar className="h-8 w-8 mt-1 border border-border/20 shadow-sm shrink-0">
                                        <AvatarFallback className={cn("text-xs font-black text-white",
                                            comment.userType === 'admin' ? "bg-amber-500" :
                                                comment.userType === 'creator' ? "bg-emerald-500" : "bg-blue-500"
                                        )}>
                                            {comment.userName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={cn(
                                        "flex flex-col gap-1 max-w-[80%]",
                                        comment.userId === currentUser.id ? "items-end" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">{comment.userName}</span>
                                            <span className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase font-black uppercase tracking-widest", getTypeColor(comment.userType))}>
                                                {comment.userType}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                                            comment.userId === currentUser.id
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-secondary text-foreground rounded-tl-sm border border-border/20"
                                        )}>
                                            {comment.content}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        activities.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                                <Activity className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-medium text-sm">No recent activity.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="relative pl-6 pb-4 last:pb-0">
                                        {/* Timeline Line */}
                                        {index !== activities.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-border/40"></div>
                                        )}

                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute left-0 top-1.5 h-[24px] w-[24px] rounded-full flex items-center justify-center shadow-sm z-10 border-4 border-background",
                                            getTypeColor(activity.userType || 'system')
                                        )}>
                                            <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                                        </div>

                                        <div className="glass-card bg-secondary/20 border border-border/10 p-4 rounded-2xl ml-2">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm">{activity.action}</span>
                                                    {activity.userName && (
                                                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-widest", getTypeColor(activity.userType || 'system'))}>
                                                            {activity.userName}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1">
                                                    {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {activeTab === 'comments' && (
                    <div className="p-4 border-t border-border/10 bg-secondary/10">
                        <form onSubmit={handlePostComment} className="flex gap-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your message..."
                                className="rounded-xl border-border/20 shadow-inner bg-secondary/30 h-11 focus-visible:ring-primary/20"
                                disabled={isSubmitting}
                            />
                            <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="h-11 rounded-xl w-14 shrink-0 shadow-lg shadow-primary/20">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

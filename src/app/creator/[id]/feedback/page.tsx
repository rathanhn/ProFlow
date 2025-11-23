'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import FeedbackForm from '@/components/FeedbackForm';
import { getAssignee } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import { useToast } from '@/components/ui/toast-system';

export default function CreatorFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const [creator, setCreator] = useState<Assignee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedParams = await params;
                const creatorData = await getAssignee(resolvedParams.id);

                if (!creatorData) {
                    notFound();
                    return;
                }

                setCreator(creatorData);
            } catch (error) {
                console.error('Error loading creator:', error);
                showToast({
                    type: 'error',
                    message: 'Failed to load user data',
                    style: 'modern'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [params, showToast]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!creator) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6 fab-safe-bottom">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Send Feedback</h1>
                    <p className="text-muted-foreground">
                        Help us improve the platform by sharing your thoughts or reporting issues.
                    </p>
                </div>

                <div className="flex justify-center">
                    <FeedbackForm
                        userType="creator"
                        userId={creator.id}
                        userName={creator.name}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

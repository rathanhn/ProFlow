'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import FeedbackForm from '@/components/FeedbackForm';
import { getClient } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import { useToast } from '@/components/ui/toast-system';

export default function ClientFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Unwrap params using React.use() or await in useEffect if it was a server component, 
    // but since this is a client component receiving a promise (Next.js 15+ style), we handle it carefully.
    // Actually, for client components in Next.js 15, params is a Promise.
    // Let's use useEffect to unwrap it.

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedParams = await params;
                const clientData = await getClient(resolvedParams.id);

                if (!clientData) {
                    notFound();
                    return;
                }

                setClient(clientData);
            } catch (error) {
                console.error('Error loading client:', error);
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

    if (!client) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6 fab-safe-bottom">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Send Feedback</h1>
                    <p className="text-muted-foreground">
                        We value your input! Let us know how we can improve your experience.
                    </p>
                </div>

                <div className="flex justify-center">
                    <FeedbackForm
                        userType="client"
                        userId={client.id}
                        userName={client.name}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

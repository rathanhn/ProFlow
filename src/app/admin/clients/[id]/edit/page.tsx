
import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { getClient } from "@/lib/firebase-service";
import { Client } from "@/lib/types";
import { validateRouteId, sanitizeRouteParam } from "@/lib/auth-utils";

export default async function EditClientPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id: rawId } = await params;
    const { redirect } = await searchParams;
    const redirectPath = typeof redirect === 'string' ? redirect : undefined;

    // Validate and sanitize the route parameter
    if (!validateRouteId(rawId)) {
        console.warn(`Invalid client ID attempted: ${rawId}`);
        notFound();
    }

    const id = sanitizeRouteParam(rawId);

    try {
        const rawClient = await getClient(id);

        if (!rawClient) {
            console.warn(`Client not found: ${id}`);
            notFound();
        }

        // Serialize the client data to ensure it's a plain object
        const client = JSON.parse(JSON.stringify(rawClient)) as Client;

        return (
            <DashboardLayout>
                <ClientForm client={client} redirectPath={redirectPath || `/admin/clients/${id}`} />
            </DashboardLayout>
        );
    } catch (error) {
        console.error(`Error loading client ${id}:`, error);
        notFound();
    }
}

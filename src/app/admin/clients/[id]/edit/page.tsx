
import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { getClient } from "@/lib/firebase-service";
import { Client } from "@/lib/types";
import { validateRouteId, sanitizeRouteParam } from "@/lib/auth-utils";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params;

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
                <ClientForm client={client} redirectPath={`/admin/clients/${id}`} />
            </DashboardLayout>
        );
    } catch (error) {
        console.error(`Error loading client ${id}:`, error);
        notFound();
    }
}

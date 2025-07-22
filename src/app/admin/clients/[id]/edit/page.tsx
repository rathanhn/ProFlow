
'use client';

import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { getClient } from "@/lib/firebase-service";
import { Client } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import React from "react";

export default function EditClientPage() {
    const params = useParams();
    const id = params.id as string;
    const [client, setClient] = React.useState<Client | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchClient = async () => {
            const clientData = await getClient(id);
            if (!clientData) {
                notFound();
            }
            setClient(clientData);
            setLoading(false);
        };
        fetchClient();
    }, [id]);

    if (loading) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    // Ensure client data is serializable
    const serializableClient = client ? {
        ...client,
        // Convert any non-serializable fields here if necessary
    } : null;


    if (!serializableClient) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <ClientForm client={serializableClient} />
        </DashboardLayout>
    );
}

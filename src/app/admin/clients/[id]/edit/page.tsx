
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
        if (id) {
            const fetchClient = async () => {
                const clientData = await getClient(id);
                if (!clientData) {
                    notFound();
                }
                // Serialize the client data to ensure it's a plain object
                setClient(clientData ? JSON.parse(JSON.stringify(clientData)) : null);
                setLoading(false);
            };
            fetchClient();
        }
    }, [id]);

    if (loading) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    if (!client) {
        return <DashboardLayout><div>Client not found.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <ClientForm client={client} />
        </DashboardLayout>
    );
}

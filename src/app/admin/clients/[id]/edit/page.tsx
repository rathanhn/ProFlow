
'use client';

import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { clients } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import React from "react";

export default function EditClientPage() {
    const params = useParams();
    const id = params.id as string;
    const client = clients.find(c => c.id === id);

    if (!client) {
        notFound();
    }

    return (
        <DashboardLayout>
            <ClientForm client={client} />
        </DashboardLayout>
    );
}

import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { clients } from "@/lib/data";
import { notFound } from "next/navigation";
import React from "react";

export default function EditClientPage({ params }: { params: { id: string } }) {
    const client = clients.find(c => c.id === params.id);

    if (!client) {
        notFound();
    }

    return (
        <DashboardLayout>
            <ClientForm client={client} />
        </DashboardLayout>
    );
}

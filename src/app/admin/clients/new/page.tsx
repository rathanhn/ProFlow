import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";

export default async function NewClientPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { redirect } = await searchParams;
    const redirectPath = typeof redirect === 'string' ? redirect : undefined;

    return (
        <DashboardLayout>
            <ClientForm redirectPath={redirectPath} />
        </DashboardLayout>
    );
}

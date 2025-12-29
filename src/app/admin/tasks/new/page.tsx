import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";

export default async function NewTaskPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { redirect, clientId } = await searchParams;
    const redirectPath = typeof redirect === 'string' ? redirect : undefined;
    const initialClientId = typeof clientId === 'string' ? clientId : undefined;

    return (
        <DashboardLayout>
            <TaskForm redirectPath={redirectPath} initialClientId={initialClientId} />
        </DashboardLayout>
    );
}

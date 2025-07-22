import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { tasks } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditTaskPage({ params }: { params: { id: string } }) {
    const task = tasks.find(t => t.id === params.id);

    if (!task) {
        notFound();
    }

    return (
        <DashboardLayout>
            <TaskForm task={task} />
        </DashboardLayout>
    );
}

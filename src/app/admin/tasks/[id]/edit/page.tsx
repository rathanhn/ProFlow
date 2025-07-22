import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { tasks } from "@/lib/data";
import { notFound } from "next/navigation";
import React from "react";

export default function EditTaskPage({ params }: { params: { id: string } }) {
    const id = params.id;
    const task = tasks.find(t => t.id === id);

    if (!task) {
        notFound();
    }

    return (
        <DashboardLayout>
            <TaskForm task={task} />
        </DashboardLayout>
    );
}

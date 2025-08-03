
import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { getTask } from "@/lib/firebase-service";
import { Task } from "@/lib/types";
import { validateRouteId, sanitizeRouteParam } from "@/lib/auth-utils";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params;

    // Validate and sanitize the route parameter
    if (!validateRouteId(rawId)) {
        console.warn(`Invalid task ID attempted: ${rawId}`);
        notFound();
    }

    const id = sanitizeRouteParam(rawId);

    try {
        const rawTask = await getTask(id);

        if (!rawTask) {
            console.warn(`Task not found: ${id}`);
            notFound();
        }

        // Ensure task data is serializable
        const task: Task = {
            ...rawTask,
            acceptedDate: new Date(rawTask.acceptedDate).toISOString(),
            submissionDate: new Date(rawTask.submissionDate).toISOString(),
        };

        return (
            <DashboardLayout>
                <TaskForm task={task} />
            </DashboardLayout>
        );
    } catch (error) {
        console.error(`Error loading task ${id}:`, error);
        notFound();
    }
}

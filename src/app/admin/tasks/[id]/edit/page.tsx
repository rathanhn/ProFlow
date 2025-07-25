
'use client';

import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { getTask } from "@/lib/firebase-service";
import { Task } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import React from "react";

export default function EditTaskPage() {
    const params = useParams();
    const id = params.id as string;
    const [task, setTask] = React.useState<Task | null>(null);
    const [loading, setLoading] = React.useState(true);


    React.useEffect(() => {
        const fetchTask = async () => {
            if (!id) return;
            const taskData = await getTask(id);
            if (!taskData) {
                notFound();
            }
            setTask(taskData);
            setLoading(false);
        };
        fetchTask();
    }, [id]);

    if (loading) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }
    
    // Ensure task data is serializable
    const serializableTask = task ? {
        ...task,
        acceptedDate: new Date(task.acceptedDate).toISOString(),
        submissionDate: new Date(task.submissionDate).toISOString(),
    } : null;

    if (!serializableTask) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <TaskForm task={serializableTask} />
        </DashboardLayout>
    );
}

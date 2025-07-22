
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

    React.useEffect(() => {
        const fetchTask = async () => {
            const taskData = await getTask(id);
            if (!taskData) {
                notFound();
            }
            setTask(taskData);
        };
        fetchTask();
    }, [id]);

    if (!task) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <TaskForm task={task} />
        </DashboardLayout>
    );
}

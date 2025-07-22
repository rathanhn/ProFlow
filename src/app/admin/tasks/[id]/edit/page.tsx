
'use client';

import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { tasks } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import React from "react";

export default function EditTaskPage() {
    const params = useParams();
    const id = params.id as string;
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

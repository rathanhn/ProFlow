import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getAssignee, getTasks } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import CreatorTasksView from './CreatorTasksView';

interface CreatorDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CreatorDetailPage({ params }: CreatorDetailPageProps) {
    try {
        // Await params first
        const resolvedParams = await params;

        // Fetch creator and all tasks
        const [rawCreator, rawTasks] = await Promise.all([
            getAssignee(resolvedParams.id),
            getTasks()
        ]);

        if (!rawCreator) {
            notFound();
        }

        // Serialize data
        const creator = JSON.parse(JSON.stringify(rawCreator)) as Assignee;
        const allTasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];

        // Filter tasks assigned to this creator
        const creatorTasks = allTasks.filter(task => task.assigneeId === resolvedParams.id);

        return (
            <DashboardLayout>
                <CreatorTasksView creator={creator} tasks={creatorTasks} />
            </DashboardLayout>
        );
    } catch (error) {
        console.error('Error loading creator details:', error);
        notFound();
    }
}

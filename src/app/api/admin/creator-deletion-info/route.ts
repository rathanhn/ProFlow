import { NextRequest, NextResponse } from 'next/server';
import { getTasksByAssigneeId, getAssignees } from '@/lib/firebase-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Get assigned tasks and available creators for reassignment
    const [assignedTasks, allCreators] = await Promise.all([
      getTasksByAssigneeId(creatorId),
      getAssignees()
    ]);

    // Filter out the creator being deleted from available reassignment options
    const availableCreators = allCreators
      .filter(creator => creator.id !== creatorId)
      .map(creator => ({
        id: creator.id,
        name: creator.name,
        email: creator.email
      }));

    return NextResponse.json({
      assignedTasksCount: assignedTasks.length,
      availableCreators,
      taskDetails: assignedTasks.map(task => ({
        id: task.id,
        projectName: task.projectName,
        clientName: task.clientName,
        workStatus: task.workStatus,
        submissionDate: task.submissionDate
      }))
    });

  } catch (error) {
    console.error('[CREATOR DELETION INFO] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get creator deletion info', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

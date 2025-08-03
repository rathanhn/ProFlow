import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { 
  deleteAssignee, 
  getTasksByAssigneeId, 
  updateTask,
  getTasks 
} from '@/lib/firebase-service';

export async function DELETE(request: NextRequest) {
  try {
    const { creatorId, adminEmail, reassignTo } = await request.json();

    if (!creatorId || !adminEmail) {
      return NextResponse.json(
        { error: 'Creator ID and admin email are required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    try {
      const adminUser = await adminAuth.getUserByEmail(adminEmail);
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin not found' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin' },
        { status: 403 }
      );
    }

    // Get creator data before deletion
    const creatorDoc = await adminDb.collection('assignees').doc(creatorId).get();
    if (!creatorDoc.exists) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    const creatorData = creatorDoc.data();
    const creatorEmail = creatorData?.email;

    console.log(`[DELETE CREATOR] Starting deletion process for creator: ${creatorId}`);

    // Step 1: Get all assigned tasks
    const assignedTasks = await getTasksByAssigneeId(creatorId);
    console.log(`[DELETE CREATOR] Found ${assignedTasks.length} assigned tasks`);

    // Step 2: Handle task reassignment or unassignment
    const taskUpdatePromises = assignedTasks.map(async (task) => {
      try {
        if (reassignTo && reassignTo !== 'unassign') {
          // Reassign to another creator
          await updateTask(task.id, {
            assignee: reassignTo,
            assigneeId: reassignTo,
            updatedAt: new Date().toISOString(),
            reassignedFrom: creatorId,
            reassignedAt: new Date().toISOString(),
            reassignedBy: adminEmail
          });
          console.log(`[DELETE CREATOR] Reassigned task ${task.id} to ${reassignTo}`);
        } else {
          // Unassign the task
          await updateTask(task.id, {
            assignee: null,
            assigneeId: null,
            updatedAt: new Date().toISOString(),
            unassignedFrom: creatorId,
            unassignedAt: new Date().toISOString(),
            unassignedBy: adminEmail
          });
          console.log(`[DELETE CREATOR] Unassigned task ${task.id}`);
        }
      } catch (error) {
        console.error(`[DELETE CREATOR] Failed to handle task ${task.id}:`, error);
        throw error;
      }
    });

    // Execute all task updates
    await Promise.all(taskUpdatePromises);

    // Step 3: Delete Firebase Auth account if email exists
    if (creatorEmail) {
      try {
        const userRecord = await adminAuth.getUserByEmail(creatorEmail);
        await adminAuth.deleteUser(userRecord.uid);
        console.log(`[DELETE CREATOR] Deleted Firebase Auth account: ${creatorEmail}`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`[DELETE CREATOR] Firebase Auth account not found for: ${creatorEmail}`);
        } else {
          console.error(`[DELETE CREATOR] Failed to delete Firebase Auth account:`, authError);
          // Don't throw here - continue with Firestore deletion
        }
      }
    }

    // Step 4: Delete creator document from Firestore
    await deleteAssignee(creatorId);
    console.log(`[DELETE CREATOR] Deleted creator document: ${creatorId}`);

    // Step 5: Create deletion audit log
    await adminDb.collection('audit_logs').add({
      action: 'CREATOR_DELETED',
      adminEmail,
      creatorId,
      creatorEmail: creatorEmail || 'N/A',
      deletedData: {
        tasksReassigned: reassignTo && reassignTo !== 'unassign' ? assignedTasks.length : 0,
        tasksUnassigned: !reassignTo || reassignTo === 'unassign' ? assignedTasks.length : 0,
        reassignedTo: reassignTo || null,
        creatorName: creatorData?.name || 'Unknown'
      },
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Creator and all associated data handled successfully',
      deletedData: {
        creatorId,
        tasksReassigned: reassignTo && reassignTo !== 'unassign' ? assignedTasks.length : 0,
        tasksUnassigned: !reassignTo || reassignTo === 'unassign' ? assignedTasks.length : 0,
        authAccountDeleted: !!creatorEmail,
        reassignedTo: reassignTo || null
      }
    });

  } catch (error) {
    console.error('[DELETE CREATOR] Error:', error);
    
    // Log the error for debugging
    try {
      await adminDb.collection('error_logs').add({
        action: 'CREATOR_DELETION_FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        details: error
      });
    } catch (logError) {
      console.error('[DELETE CREATOR] Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete creator', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

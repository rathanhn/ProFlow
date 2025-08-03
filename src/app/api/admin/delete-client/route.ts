import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { 
  deleteClient, 
  getTasksByClientId, 
  deleteTask,
  getTransactionsByClientId,
  deleteTransaction 
} from '@/lib/firebase-service';

export async function DELETE(request: NextRequest) {
  try {
    const { clientId, adminEmail } = await request.json();

    if (!clientId || !adminEmail) {
      return NextResponse.json(
        { error: 'Client ID and admin email are required' },
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

    // Get client data before deletion
    const clientDoc = await adminDb.collection('clients').doc(clientId).get();
    if (!clientDoc.exists) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const clientData = clientDoc.data();
    const clientEmail = clientData?.email;

    console.log(`[DELETE CLIENT] Starting deletion process for client: ${clientId}`);

    // Step 1: Get all associated data
    const [clientTasks, clientTransactions] = await Promise.all([
      getTasksByClientId(clientId),
      getTransactionsByClientId(clientId)
    ]);

    console.log(`[DELETE CLIENT] Found ${clientTasks.length} tasks and ${clientTransactions.length} transactions`);

    // Step 2: Delete all associated tasks
    const taskDeletionPromises = clientTasks.map(async (task) => {
      try {
        await deleteTask(task.id);
        console.log(`[DELETE CLIENT] Deleted task: ${task.id}`);
      } catch (error) {
        console.error(`[DELETE CLIENT] Failed to delete task ${task.id}:`, error);
        throw error;
      }
    });

    // Step 3: Delete all associated transactions
    const transactionDeletionPromises = clientTransactions.map(async (transaction) => {
      try {
        await deleteTransaction(transaction.id);
        console.log(`[DELETE CLIENT] Deleted transaction: ${transaction.id}`);
      } catch (error) {
        console.error(`[DELETE CLIENT] Failed to delete transaction ${transaction.id}:`, error);
        throw error;
      }
    });

    // Execute all deletions in parallel
    await Promise.all([...taskDeletionPromises, ...transactionDeletionPromises]);

    // Step 4: Delete Firebase Auth account if email exists
    if (clientEmail) {
      try {
        const userRecord = await adminAuth.getUserByEmail(clientEmail);
        await adminAuth.deleteUser(userRecord.uid);
        console.log(`[DELETE CLIENT] Deleted Firebase Auth account: ${clientEmail}`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`[DELETE CLIENT] Firebase Auth account not found for: ${clientEmail}`);
        } else {
          console.error(`[DELETE CLIENT] Failed to delete Firebase Auth account:`, authError);
          // Don't throw here - continue with Firestore deletion
        }
      }
    }

    // Step 5: Delete client document from Firestore
    await deleteClient(clientId);
    console.log(`[DELETE CLIENT] Deleted client document: ${clientId}`);

    // Step 6: Create deletion audit log
    await adminDb.collection('audit_logs').add({
      action: 'CLIENT_DELETED',
      adminEmail,
      clientId,
      clientEmail: clientEmail || 'N/A',
      deletedData: {
        tasksCount: clientTasks.length,
        transactionsCount: clientTransactions.length,
        clientName: clientData?.name || 'Unknown'
      },
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Client and all associated data deleted successfully',
      deletedData: {
        clientId,
        tasksDeleted: clientTasks.length,
        transactionsDeleted: clientTransactions.length,
        authAccountDeleted: !!clientEmail
      }
    });

  } catch (error) {
    console.error('[DELETE CLIENT] Error:', error);
    
    // Log the error for debugging
    try {
      await adminDb.collection('error_logs').add({
        action: 'CLIENT_DELETION_FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        details: error
      });
    } catch (logError) {
      console.error('[DELETE CLIENT] Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete client', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

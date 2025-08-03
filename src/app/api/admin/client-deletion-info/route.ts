import { NextRequest, NextResponse } from 'next/server';
import { getTasksByClientId, getTransactionsByClientId } from '@/lib/firebase-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get associated data counts
    const [clientTasks, clientTransactions] = await Promise.all([
      getTasksByClientId(clientId),
      getTransactionsByClientId(clientId)
    ]);

    return NextResponse.json({
      tasksCount: clientTasks.length,
      transactionsCount: clientTransactions.length,
      taskDetails: clientTasks.map(task => ({
        id: task.id,
        projectName: task.projectName,
        workStatus: task.workStatus,
        total: task.total
      })),
      transactionDetails: clientTransactions.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type
      }))
    });

  } catch (error) {
    console.error('[CLIENT DELETION INFO] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get client deletion info', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

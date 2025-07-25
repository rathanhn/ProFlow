


'use server';

import { auth, db, createSecondaryAuth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc, orderBy, writeBatch, runTransaction } from 'firebase/firestore';
import { Client, Task, Assignee, Notification, Transaction, PaymentMethod } from './types';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

// This is a placeholder for a server-side admin function to delete a user.
// In a real application, this would use the Firebase Admin SDK.
// Since we don't have the Admin SDK initialized, we'll log the action.
async function deleteAuthUser(uid: string) {
    console.log(`[Auth Deletion] An admin SDK would be required to delete user ${uid}. This is a simulated action.`);
    // Example with Admin SDK:
    // import { getAuth } from 'firebase-admin/auth';
    // await getAuth().deleteUser(uid);
    return;
}


// Client Functions
export async function getClients(): Promise<Client[]> {
    const clientsCol = collection(db, 'clients');
    const clientSnapshot = await getDocs(clientsCol);
    const clientList = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    return clientList;
}

export async function getClient(id: string): Promise<Client | null> {
    console.log(`[firebase-service] getClient called with ID: ${id}`);
    if (!id) {
        return null;
    }
    const clientDocRef = doc(db, 'clients', id);
    const clientSnap = await getDoc(clientDocRef);
    if (clientSnap.exists()) {
        const clientData = clientSnap.data();
        console.log(`[firebase-service] getClient found document for ID: ${id}`, clientData);
        return JSON.parse(JSON.stringify({ id: clientSnap.id, ...clientData })) as Client;
    } else {
        console.error(`[firebase-service] getClient did NOT find document for ID: ${id}`);
        return null;
    }
}

export async function addClient(client: Omit<Client, 'id' | 'password'>) {
    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-12);

    const { email, ...clientData } = client;
    const secondaryAuth = createSecondaryAuth();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "clients", uid), {email, ...clientData});
        
        // Send password reset email to allow user to set their own password
        await sendPasswordResetEmail(secondaryAuth, email);

        revalidatePath('/admin/clients');
        return { id: uid, ...clientData };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("A user with this email already exists.");
        }
        throw error;
    } finally {
        await signOut(secondaryAuth);
    }
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id' | 'password'>>) {
    const clientDocRef = doc(db, 'clients', id);
    await updateDoc(clientDocRef, client);
    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${id}/edit`);
}

export async function deleteClient(id: string) {
    const batch = writeBatch(db);

    // 1. Delete client document
    const clientDocRef = doc(db, 'clients', id);
    batch.delete(clientDocRef);

    // 2. Find and delete associated tasks
    const tasksQuery = query(collection(db, 'tasks'), where('clientId', '==', id));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach(doc => batch.delete(doc.ref));

    // 3. Find and delete associated transactions
    const transactionsQuery = query(collection(db, 'transactions'), where('clientId', '==', id));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    transactionsSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // 4. Find and delete associated notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', id));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 5. Commit all Firestore deletions
    await batch.commit();

    // 6. Delete Firebase Auth user
    // This requires the Admin SDK and cannot be done securely from the client-side SDK.
    // We are simulating this action. In a production environment, you would use a Cloud Function
    // triggered by the document deletion or an admin backend.
    await deleteAuthUser(id);
    
    revalidatePath('/admin/clients');
    revalidatePath('/admin/tasks');
    revalidatePath('/admin/transactions');
}

export async function getClientByEmail(email: string): Promise<Client | null> {
    console.log(`[firebase-service] getClientByEmail called with email: ${email}`);
    const q = query(collection(db, "clients"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const client = { id: doc.id, ...doc.data() } as Client;
        console.log(`[firebase-service] getClientByEmail found client:`, client);
        return client;
    }
    console.log(`[firebase-service] getClientByEmail did NOT find client for email: ${email}`);
    return null;
}


// Task Functions
export async function getTasks(): Promise<Task[]> {
    const tasksCol = collection(db, 'tasks');
    const taskSnapshot = await getDocs(query(tasksCol, orderBy('slNo', 'desc')));
    const taskList = taskSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            acceptedDate: new Date(data.acceptedDate).toISOString(),
            submissionDate: new Date(data.submissionDate).toISOString(),
        } as Task;
    });
    return taskList;
}

export async function getTasksByClientId(clientId: string): Promise<Task[]> {
    const q = query(collection(db, "tasks"), where("clientId", "==", clientId));
    const taskSnapshot = await getDocs(q);
    const taskList = taskSnapshot.docs.map(doc => {
        const data = doc.data();
         return { 
            id: doc.id, 
            ...data,
            acceptedDate: new Date(data.acceptedDate).toISOString(),
            submissionDate: new Date(data.submissionDate).toISOString(),
        } as Task;
    });
    return taskList;
}

export async function getTasksByAssigneeId(assigneeId: string): Promise<Task[]> {
    const q = query(collection(db, "tasks"), where("assigneeId", "==", assigneeId));
    const taskSnapshot = await getDocs(q);
    const taskList = taskSnapshot.docs.map(doc => {
        const data = doc.data();
         return { 
            id: doc.id, 
            ...data,
            acceptedDate: new Date(data.acceptedDate).toISOString(),
            submissionDate: new Date(data.submissionDate).toISOString(),
        } as Task;
    });
    return taskList;
}


export async function getTask(id: string): Promise<Task | null> {
    const taskDocRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskDocRef);
    if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        return JSON.parse(JSON.stringify({ id: taskSnap.id, ...taskData })) as Task;
    } else {
        return null;
    }
}

export async function addTask(task: Omit<Task, 'id'>) {
    const tasksCol = collection(db, 'tasks');
    const docRef = await addDoc(tasksCol, task);
    revalidatePath('/admin/tasks');
    return { id: docRef.id, ...task };
}

export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'slNo' | 'clientId'>>) {
    const taskDocRef = doc(db, 'tasks', id);
    const existingTask = await getTask(id);
    if (!existingTask) throw new Error("Task not found");
    
    const total = (task.pages ?? existingTask.pages) * (task.rate ?? existingTask.rate);

    await updateDoc(taskDocRef, { ...task, total });
    revalidatePath('/admin/tasks');
    revalidatePath(`/admin/tasks/${id}`);
    revalidatePath(`/admin/tasks/${id}/edit`);
    revalidatePath(`/client/${existingTask.clientId}/projects`);
    revalidatePath(`/client/${existingTask.clientId}/projects/${id}`);
}

// Assignee Functions
export async function getAssignees(): Promise<Assignee[]> {
    const assigneesCol = collection(db, 'assignees');
    const assigneeSnapshot = await getDocs(assigneesCol);
    return assigneeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignee));
}

export async function getAssignee(id: string): Promise<Assignee | null> {
    const assigneeDocRef = doc(db, 'assignees', id);
    const assigneeSnap = await getDoc(assigneeDocRef);
    if (assigneeSnap.exists()) {
        return { id: assigneeSnap.id, ...assigneeSnap.data() } as Assignee;
    }
    return null;
}

export async function getAssigneeByEmail(email: string): Promise<Assignee | null> {
    const q = query(collection(db, "assignees"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Assignee;
    }
    return null;
}

export async function addAssignee(assignee: Omit<Assignee, 'id' | 'password'>): Promise<Assignee> {
    if (!assignee.email) {
        throw new Error("Email is required to create a creator.");
    }
    
    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    
    const { email, ...assigneeData } = assignee;
    const secondaryAuth = createSecondaryAuth();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "assignees", uid), { email, ...assigneeData });
        
        // Send password reset email to allow user to set their own password
        await sendPasswordResetEmail(secondaryAuth, email);

        revalidatePath('/admin/team');
        revalidatePath('/admin/tasks/new');
        revalidatePath('/admin/tasks/*');
        return { id: uid, email, ...assigneeData };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("A user with this email already exists.");
        }
        throw error;
    } finally {
        await signOut(secondaryAuth);
    }
}

export async function updateAssignee(id: string, assignee: Partial<Omit<Assignee, 'id'>>) {
    const assigneeDocRef = doc(db, 'assignees', id);
    await updateDoc(assigneeDocRef, assignee);
    revalidatePath('/admin/team');
}

export async function deleteTask(id: string) {
    const taskDocRef = doc(db, 'tasks', id);
    await deleteDoc(taskDocRef);
    revalidatePath('/admin/tasks');
}


export async function deleteAssignee(id: string) {
    const batch = writeBatch(db);

    // 1. Delete assignee document
    const assigneeDocRef = doc(db, 'assignees', id);
    batch.delete(assigneeDocRef);

    // 2. Find all tasks assigned to the creator and un-assign them
    const tasksQuery = query(collection(db, 'tasks'), where('assigneeId', '==', id));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach(doc => {
        batch.update(doc.ref, {
            assigneeId: '',
            assigneeName: ''
        });
    });

    // 3. Find and delete associated notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', id));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 4. Commit all Firestore changes
    await batch.commit();

    // 5. Delete Firebase Auth user
    await deleteAuthUser(id);

    revalidatePath('/admin/team');
    revalidatePath('/admin/tasks');
}


// Notification Functions
export async function createNotification(notification: Omit<Notification, 'id'>) {
    const notificationsCol = collection(db, 'notifications');
    await addDoc(notificationsCol, notification);
    revalidatePath('/admin');
    if (notification.userId.startsWith('admin')) {
        // No specific path to revalidate for admin, handled by listener
    } else {
        revalidatePath(`/client/${notification.userId}`);
        revalidatePath(`/creator/${notification.userId}`);
    }
}

export async function getAdminNotifications(): Promise<Notification[]> {
    const q = query(
        collection(db, "notifications"), 
        where("userId", "==", "admin")
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    
    return notifications
        .filter(n => !n.isRead)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(id: string) {
    const notificationDocRef = doc(db, 'notifications', id);
    await updateDoc(notificationDocRef, { isRead: true });
}

export async function deleteNotification(id: string) {
    const notificationDocRef = doc(db, 'notifications', id);
    await deleteDoc(notificationDocRef);
}

export async function clearNotifications(userId: string) {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}

// Transaction Functions
export async function addTransactionAndUpdateTask(
    taskId: string,
    amountPaid: number,
    paymentMethod: PaymentMethod,
    notes?: string
) {
    const taskDocRef = doc(db, 'tasks', taskId);
    const transactionCol = collection(db, 'transactions');

    try {
        const taskData = await runTransaction(db, async (transaction) => {
            const taskDoc = await transaction.get(taskDocRef);
            if (!taskDoc.exists()) {
                throw "Task document does not exist!";
            }

            const currentTaskData = taskDoc.data() as Task;
            const newAmountPaid = (currentTaskData.amountPaid || 0) + amountPaid;
            const remainingAmount = currentTaskData.total - newAmountPaid;
            
            let newPaymentStatus = currentTaskData.paymentStatus;
            if (remainingAmount <= 0) {
                newPaymentStatus = 'Paid';
            } else if (newAmountPaid > 0) {
                newPaymentStatus = 'Partial';
            } else {
                newPaymentStatus = 'Unpaid';
            }

            transaction.update(taskDocRef, { 
                amountPaid: newAmountPaid,
                paymentStatus: newPaymentStatus
            });

            const newTransaction: Omit<Transaction, 'id'> = {
                taskId: taskId,
                clientId: currentTaskData.clientId,
                projectName: currentTaskData.projectName,
                clientName: currentTaskData.clientName,
                amount: amountPaid,
                paymentMethod: paymentMethod,
                transactionDate: new Date().toISOString(),
                notes: notes,
            };
            transaction.set(doc(transactionCol), newTransaction);
            return currentTaskData;
        });

        revalidatePath('/admin/tasks');
        revalidatePath(`/admin/tasks/${taskId}`);
        revalidatePath('/admin/tasks/*');
        revalidatePath('/admin/transactions');
        if(taskData){
           revalidatePath(`/client/${taskData.clientId}`);
           revalidatePath(`/client/${taskData.clientId}/projects`);
           revalidatePath(`/client/${taskData.clientId}/projects/${taskId}`);
           revalidatePath(`/client/${taskData.clientId}/transactions`);
        }


    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Failed to process transaction.");
    }
}


export async function getTransactions(): Promise<Transaction[]> {
    const transactionsCol = collection(db, 'transactions');
    const transactionSnapshot = await getDocs(query(transactionsCol, orderBy('transactionDate', 'desc')));
    const transactionList = transactionSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            transactionDate: new Date(data.transactionDate).toISOString(),
        } as Transaction;
    });
    return transactionList;
}

export async function getTransactionsByClientId(clientId: string): Promise<Transaction[]> {
    const q = query(collection(db, "transactions"), where("clientId", "==", clientId));
    const transactionSnapshot = await getDocs(q);
    const transactionList = transactionSnapshot.docs.map(doc => {
        const data = doc.data();
         return { 
            id: doc.id, 
            ...data,
            transactionDate: new Date(data.transactionDate).toISOString(),
        } as Transaction;
    });
    
    transactionList.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    return transactionList;
}

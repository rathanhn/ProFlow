
'use server';

import { auth, db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc, orderBy, limit, writeBatch, runTransaction } from 'firebase/firestore';
import { Client, Task, Assignee, Notification, Transaction, PaymentMethod } from './types';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';

// Client Functions
export async function getClients(): Promise<Client[]> {
    const clientsCol = collection(db, 'clients');
    const clientSnapshot = await getDocs(clientsCol);
    const clientList = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    return clientList;
}

export async function getClient(id: string): Promise<Client | null> {
    const clientDocRef = doc(db, 'clients', id);
    const clientSnap = await getDoc(clientDocRef);
    if (clientSnap.exists()) {
        const clientData = clientSnap.data();
        // Ensure data is serializable
        return JSON.parse(JSON.stringify({ id: clientSnap.id, ...clientData })) as Client;
    } else {
        return null;
    }
}

export async function addClient(client: Omit<Client, 'id'>) {
    if (!client.password) {
        throw new Error("Password is required to create a client.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, client.email, client.password);
    const uid = userCredential.user.uid;

    const { password, ...clientData } = client;

    await setDoc(doc(db, "clients", uid), clientData);
    revalidatePath('/admin/clients');
    return uid;
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id' | 'password'>>) {
    const clientDocRef = doc(db, 'clients', id);
    await updateDoc(clientDocRef, client);
    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${id}/edit`);
}

export async function deleteClient(id: string) {
    const clientDocRef = doc(db, 'clients', id);
    await deleteDoc(clientDocRef);
    // Note: This does not delete the user from Firebase Auth.
    // That would require a separate admin SDK setup.
    revalidatePath('/admin/clients');
}

export async function getClientByEmail(email: string): Promise<Client | null> {
    const q = query(collection(db, "clients"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Client;
    }
    return null;
}


// Task Functions
export async function getTasks(): Promise<Task[]> {
    const tasksCol = collection(db, 'tasks');
    const taskSnapshot = await getDocs(query(tasksCol, orderBy('slNo', 'desc')));
    const taskList = taskSnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure dates are strings
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

export async function getTask(id: string): Promise<Task | null> {
    const taskDocRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskDocRef);
    if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        // Ensure data is serializable
        return JSON.parse(JSON.stringify({ id: taskSnap.id, ...taskData })) as Task;
    } else {
        return null;
    }
}

export async function addTask(task: Omit<Task, 'id'>) {
    const tasksCol = collection(db, 'tasks');
    await addDoc(tasksCol, task);
    revalidatePath('/admin/tasks');
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

export async function addAssignee(assignee: Omit<Assignee, 'id'>): Promise<Assignee> {
    const assigneesCol = collection(db, 'assignees');
    const docRef = await addDoc(assigneesCol, assignee);
    revalidatePath('/admin/team');
    revalidatePath('/admin/tasks/new');
    revalidatePath('/admin/tasks/*');
    return { id: docRef.id, ...assignee };
}

export async function deleteTask(id: string) {
    const taskDocRef = doc(db, 'tasks', id);
    // You might want to delete related transactions as well, or handle them appropriately.
    await deleteDoc(taskDocRef);
    revalidatePath('/admin/tasks');
}


export async function deleteAssignee(id: string) {
    const assigneeDocRef = doc(db, 'assignees', id);
    await deleteDoc(assigneeDocRef);
    revalidatePath('/admin/team');
}

// Notification Functions
export async function createNotification(notification: Omit<Notification, 'id'>) {
    const notificationsCol = collection(db, 'notifications');
    await addDoc(notificationsCol, notification);
    // We don't need to revalidate paths for notifications as they are fetched client-side.
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const q = query(
        collection(db, "notifications"), 
        where("userId", "==", userId),
        limit(50)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    
    // Sort by date descending in code to avoid needing a composite index
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

            // Update the task document
            transaction.update(taskDocRef, { 
                amountPaid: newAmountPaid,
                paymentStatus: newPaymentStatus
            });

            // Create a new transaction document
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

        // Revalidate paths after the transaction is successful
        revalidatePath('/admin/tasks');
        revalidatePath(`/admin/tasks/${taskId}`);
        revalidatePath(`/admin/tasks/${taskId}/edit`);
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
    const q = query(
        collection(db, "transactions"), 
        where("clientId", "==", clientId),
        orderBy('transactionDate', 'desc')
    );
    const transactionSnapshot = await getDocs(q);
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

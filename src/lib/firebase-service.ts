
'use server';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Client, Task } from './types';
import { revalidatePath } from 'next/cache';

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
        return { id: clientSnap.id, ...clientSnap.data() } as Client;
    } else {
        return null;
    }
}

export async function addClient(client: Omit<Client, 'id'>) {
    const clientsCol = collection(db, 'clients');
    const docRef = await addDoc(clientsCol, client);
    revalidatePath('/admin/clients');
    return docRef.id;
}

export async function updateClient(id: string, client: Partial<Client>) {
    const clientDocRef = doc(db, 'clients', id);
    await updateDoc(clientDocRef, client);
    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${id}/edit`);
}

export async function deleteClient(id: string) {
    const clientDocRef = doc(db, 'clients', id);
    await deleteDoc(clientDocRef);
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
    const taskSnapshot = await getDocs(tasksCol);
    const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    return taskList;
}

export async function getTasksByClientId(clientId: string): Promise<Task[]> {
    const q = query(collection(db, "tasks"), where("clientId", "==", clientId));
    const taskSnapshot = await getDocs(q);
    const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    return taskList;
}

export async function getTask(id: string): Promise<Task | null> {
    const taskDocRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskDocRef);
    if (taskSnap.exists()) {
        return { id: taskSnap.id, ...taskSnap.data() } as Task;
    } else {
        return null;
    }
}

export async function addTask(task: Omit<Task, 'id' | 'slNo' | 'total'>) {
    const clients = await getClients();
    const client = clients.find(c => c.name === task.clientName);

    if (!client) {
        throw new Error("Client not found");
    }

    const tasks = await getTasks();

    const newTask: Omit<Task, 'id'> = {
        ...task,
        clientId: client.id,
        slNo: tasks.length + 1,
        total: task.pages * task.rate,
        acceptedDate: new Date().toISOString(),
        submissionDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // Placeholder submission
    };
    const tasksCol = collection(db, 'tasks');
    const docRef = await addDoc(tasksCol, newTask);
    revalidatePath('/admin');
    return docRef.id;
}

export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'slNo' | 'total'>>) {
    const taskDocRef = doc(db, 'tasks', id);
    const existingTask = await getTask(id);
    if (!existingTask) throw new Error("Task not found");
    
    const total = (task.pages || existingTask.pages) * (task.rate || existingTask.rate);

    await updateDoc(taskDocRef, { ...task, total });
    revalidatePath('/admin');
    revalidatePath(`/admin/tasks/${id}`);
    revalidatePath(`/admin/tasks/${id}/edit`);
}

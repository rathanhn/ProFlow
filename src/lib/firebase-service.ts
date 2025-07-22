
'use server';

import { auth, db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { Client, Task } from './types';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
    if (!client.password) {
        throw new Error("Password is required to create a client.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, client.email, client.password);
    const uid = userCredential.user.uid;

    const clientData = {
        name: client.name,
        email: client.email,
        avatar: client.avatar,
        dataAiHint: client.dataAiHint,
    };

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

export async function signInClient(email:string, password: string): Promise<any> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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
    const q = query(collection(db, "clients"), where("name", "==", task.clientName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Client not found");
    }
    const clientDoc = querySnapshot.docs[0];
    const client = { id: clientDoc.id, ...clientDoc.data() } as Client;

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

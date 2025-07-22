
import { Assignee } from './types';

// This data is now fetched from Firebase. 
// These arrays are kept to prevent breaking imports, but they should be empty.
export const clients = [];
export const tasks = [];


export const assignees: Assignee[] = [
    { id: '1', name: 'Alex' },
    { id: '2', name: 'Jordan' },
    { id: '3', name: 'Taylor' },
]

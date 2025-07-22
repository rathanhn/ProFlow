
'use client';

import { auth } from './firebase';
import { updatePassword } from 'firebase/auth';

export async function updateClientPassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (user) {
        try {
            await updatePassword(user, newPassword);
        } catch (error) {
            console.error("Firebase update password error:", error);
            // Re-throw the error to be caught by the calling function
            throw new Error("Failed to update password in Firebase.");
        }
    } else {
        throw new Error("No user is currently signed in.");
    }
}

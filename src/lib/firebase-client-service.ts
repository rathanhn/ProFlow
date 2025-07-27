
'use client';

import { auth } from './firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export async function updateClientPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (user && user.uid === userId) {
        try {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
        } catch (error: unknown) {
            console.error("Firebase update password error:", error);
            // Re-throw the error with a more specific message based on Firebase error codes
            if (error && typeof error === 'object' && 'code' in error) {
                if (error.code === 'auth/wrong-password') {
                    throw new Error('Incorrect current password.');
                } else if (error.code === 'auth/requires-recent-login') {
                     throw new Error('Please log in again to update your password.');
                }
            }
            throw new Error(error instanceof Error ? error.message : 'Failed to update password in Firebase.');
        }
    } else if (!user) {
        throw new Error("No user is currently signed in.");
    } else {
        throw new Error("Authenticated user does not match the provided user ID.");
    }
}

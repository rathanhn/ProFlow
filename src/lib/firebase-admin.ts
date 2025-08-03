// Firebase Admin SDK configuration for server-side operations
// This is a simplified version for development. In production, you would use the full Admin SDK.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp;

try {
  // Check if admin app is already initialized
  if (getApps().length === 0) {
    // In production, you would use service account credentials
    // For development, we'll create a mock admin instance
    adminApp = initializeApp({
      // You would normally include your service account here:
      // credential: cert({
      //   projectId: process.env.FIREBASE_PROJECT_ID,
      //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      //   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      // }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }, 'admin');
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // Create a mock admin app for development
  adminApp = {
    name: 'admin',
    options: {}
  };
}

// Export admin services
export const adminAuth = {
  getUserByEmail: async (email: string) => {
    console.log(`[Admin Auth] Mock: Getting user by email: ${email}`);
    // In development, return a mock user
    return {
      uid: 'mock-uid-' + email.replace('@', '-').replace('.', '-'),
      email: email,
      displayName: 'Mock User'
    };
  },
  
  deleteUser: async (uid: string) => {
    console.log(`[Admin Auth] Mock: Deleting user: ${uid}`);
    // In development, just log the action
    return Promise.resolve();
  },
  
  createUser: async (userData: any) => {
    console.log(`[Admin Auth] Mock: Creating user:`, userData);
    return {
      uid: 'mock-uid-' + Date.now(),
      email: userData.email,
      displayName: userData.displayName
    };
  }
};

export const adminDb = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: true,
        data: () => ({
          name: 'Mock Data',
          email: 'mock@example.com'
        })
      }),
      set: async (data: any) => {
        console.log(`[Admin DB] Mock: Setting document ${path}/${id}:`, data);
        return Promise.resolve();
      },
      update: async (data: any) => {
        console.log(`[Admin DB] Mock: Updating document ${path}/${id}:`, data);
        return Promise.resolve();
      },
      delete: async () => {
        console.log(`[Admin DB] Mock: Deleting document ${path}/${id}`);
        return Promise.resolve();
      }
    }),
    add: async (data: any) => {
      console.log(`[Admin DB] Mock: Adding document to ${path}:`, data);
      return {
        id: 'mock-doc-' + Date.now()
      };
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => ({
        docs: [],
        forEach: (callback: Function) => {}
      })
    })
  })
};

// Development warning
if (process.env.NODE_ENV === 'development') {
  console.warn(`
🚨 DEVELOPMENT MODE: Using mock Firebase Admin SDK
In production, you need to:
1. Install firebase-admin: npm install firebase-admin
2. Set up service account credentials
3. Configure proper environment variables
4. Replace this mock implementation with real Admin SDK
  `);
}

export default adminApp;

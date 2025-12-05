

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  Auth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqhCw9LHugRvO9_qSXgn3B7_nwS6K-s-Q",
  authDomain: "proflow-8dbu8.firebaseapp.com",
  projectId: "proflow-8dbu8",
  storageBucket: "proflow-8dbu8.firebasestorage.app",
  messagingSenderId: "1091005716189",
  appId: "1:1091005716189:web:8c4f5e17298714fc31ed34"
};

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig, "primary");
} else {
  app = getApp("primary");
}

const db = getFirestore(app);

// Explicitly initialize auth with durable (local) persistence on the client.
// On the server we fall back to getAuth to avoid touching browser-only APIs.
let auth: Auth;
if (typeof window !== "undefined") {
  // initializeAuth must only run once per app; guard with getApps above.
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch {
    // If auth was already initialized (e.g., hot reload), reuse it.
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

// Admin and client portals currently share the same Firebase project.
const clientAuth: Auth = auth;


// This is a workaround for the server-side user creation issue.
// We create a temporary, secondary Firebase app instance to handle user creation
// without affecting the main admin auth state.
export function createSecondaryAuth(): Auth {
    const secondaryAppName = `secondary-app-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    return getAuth(secondaryApp);
}


export { app, db, auth, clientAuth };

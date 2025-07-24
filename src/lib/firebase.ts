
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, browserSessionPersistence, initializeAuth, Auth, browserLocalPersistence } from "firebase/auth";

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
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Create two separate auth instances from the same app.
// This is the correct way to handle different persistence settings without re-initializing.
const auth: Auth = getAuth(app); // For admin, uses default (local) persistence
const clientAuth: Auth = initializeAuth(app, {
  persistence: browserSessionPersistence
});

export { app, db, auth, clientAuth };


import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

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

// Use getAuth to get the default auth instance.
// Persistence is now handled at the time of login.
const auth: Auth = getAuth(app); 
const clientAuth: Auth = getAuth(app); // Also get the default instance; we will set its persistence dynamically.

export { app, db, auth, clientAuth };

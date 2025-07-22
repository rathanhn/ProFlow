// @ts-nocheck
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "proflow-8dbu8",
  "appId": "1:1091005716189:web:8c4f5e17298714fc31ed34",
  "storageBucket": "proflow-8dbu8.firebasestorage.app",
  "apiKey": "AIzaSyBqhCw9LHugRvO9_qSXgn3B7_nwS6K-s-Q",
  "authDomain": "proflow-8dbu8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1091005716189"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

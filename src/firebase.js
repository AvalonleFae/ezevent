// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if in browser environment and config is present
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    if (firebaseConfig && firebaseConfig.projectId) {
      analytics = getAnalytics(app);
    } else {
      // Don't throw — analytics requires projectId and other config values
      // Log a clear warning to help debugging missing env values
      // (Common when running locally without an .env file)
      // eslint-disable-next-line no-console
      console.warn('Firebase analytics not initialized: missing firebaseConfig.projectId (set VITE_FIREBASE_PROJECT_ID in your .env)');
    }
  } catch (err) {
    // Guard against the SDK throwing when config is incomplete
    // eslint-disable-next-line no-console
    console.warn('Firebase analytics initialization failed:', err && err.message ? err.message : err);
    analytics = null;
  }
}

//Initialize Auth
export const auth=getAuth(app);

//Initialize Firestore
export const db=getFirestore(app);

//Initialize Storage
export const storage=getStorage(app);
export const storageRef = ref(storage);




export { app, analytics };
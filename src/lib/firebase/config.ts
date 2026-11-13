/**
 * src/lib/firebase/config.ts
 *
 * Firebase singleton initializer for Next.js.
 * Uses NEXT_PUBLIC_ env vars (exposed to browser).
 * getApps() check prevents re-initialization during hot reload.
 *
 * SAFETY: If NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing/empty (e.g. in local
 * dev without a .env.local file), Firebase initialization is skipped entirely.
 * All Firestore operations in firestore.ts check `isFirebaseEnabled` before
 * calling Firebase, so the app functions normally without the DB.
 * This eliminates the "FirebaseError: Missing or insufficient permissions" and
 * network connection errors in the browser console.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Check if required env vars are present
export const isFirebaseEnabled =
  typeof import.meta.env.VITE_FIREBASE_PROJECT_ID === 'string' &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID.length > 0 &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'dummy-project-id';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Only initialize Firebase if env vars are present
let db: Firestore | null = null;

if (isFirebaseEnabled) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (e) {
    // Firebase init failed (bad config, network, etc.) — degrade gracefully
    if (import.meta.env.DEV) {
      console.warn('[Firebase] Initialization failed — Firestore features disabled:', e);
    }
  }
}

export { db };
export default db;

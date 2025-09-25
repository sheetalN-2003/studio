'use server';
import 'server-only';

import admin from 'firebase-admin';

function initializeServerSideFirebase() {
  if (!admin.apps.length) {
    try {
        if(process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log("Initializing Firebase Admin SDK with service account...");
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: 'genosym-ai', // Make sure this matches your project ID
            });
        } else {
            console.warn("GOOGLE_APPLICATION_CREDENTIALS not set. Skipping Firebase Admin SDK initialization.");
            // Return dummy objects or throw an error if this is critical
            return { auth: null, firestore: null, app: null };
        }
    } catch (e) {
      console.error('Firebase Admin SDK initialization error', e);
      return { auth: null, firestore: null, app: null };
    }
  }
  
  const app = admin.app();
  const auth = admin.auth(app);
  const firestore = admin.firestore(app);

  return { auth, firestore, app };
}

// Export a function that ensures initialization and returns the services
export const { auth, firestore, app } = initializeServerSideFirebase();

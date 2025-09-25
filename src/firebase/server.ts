'use server-only';

import admin from 'firebase-admin';

function initializeServerSideFirebase() {
  if (!admin.apps.length) {
    try {
        // In a managed environment like App Hosting, the credentials are often
        // automatically available. We will attempt to initialize directly.
        admin.initializeApp({
            projectId: 'genosym-ai',
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (e) {
      console.error('Firebase Admin SDK initialization error. Ensure service account credentials are configured in your environment.', e);
      // If initialization fails, return null services to prevent the app from crashing.
      // The auth flow will handle this and show an error to the user.
      return { auth: null, firestore: null, app: null };
    }
  }
  
  const app = admin.app();
  const auth = admin.auth(app);
  const firestore = admin.firestore(app);

  return { auth, firestore, app };
}

// Export the initialized services
export const { auth, firestore, app } = initializeServerSideFirebase();

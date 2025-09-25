'use server-only';

import admin from 'firebase-admin';

function initializeServerSideFirebase() {
  if (!admin.apps.length) {
    try {
        // Use applicationDefault to automatically find and use the credentials
        // in a managed environment. This is more robust.
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'genosym-ai',
        });
        console.log("Firebase Admin SDK initialized successfully with Application Default Credentials.");
    } catch (e) {
      console.error('Firebase Admin SDK initialization error. Ensure service account credentials are configured in your environment.', e);
      return { auth: null, firestore: null, app: null };
    }
  }
  
  const app = admin.app();
  const auth = admin.auth(app);
  const firestore = admin.firestore(app);

  return { auth, firestore, app };
}

export const { auth, firestore, app } = initializeServerSideFirebase();

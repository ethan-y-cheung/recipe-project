import admin from "firebase-admin";

// check if app has already been created, might have happened in middleware (?)
const app = admin.apps.length 
  ? admin.app() 
  : admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replaces literal '\n' characters with actual line breaks for the certificate PEM format
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

export const db = app.firestore();

// Export the base admin namespace for utility types if needed elsewhere (?)
export default admin;
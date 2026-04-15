import admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | null = null;

// Only initialize Firebase Admin if valid credentials are provided
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  
  // Check if we have valid credentials
  const hasValidCredentials = 
    privateKey && 
    projectId && 
    clientEmail &&
    privateKey.length > 100 && // Private key should be long
    privateKey.includes('BEGIN PRIVATE KEY') && // Should have proper format
    !projectId.includes('demo-project') &&
    !clientEmail.includes('demo-project');

  if (hasValidCredentials) {
    try {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error: any) {
      console.warn('⚠️ Firebase Admin initialization failed:', error.message);
      console.warn('   Continuing without Firebase Admin. Token verification will be skipped.');
    }
  } else {
    console.warn('⚠️ Firebase Admin credentials not properly configured.');
    console.warn('   Continuing without Firebase Admin. Token verification will be skipped.');
  }
}

export const auth = admin.apps.length > 0 ? admin.auth() : null;
export default admin;

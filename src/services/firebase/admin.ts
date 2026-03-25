import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
// This should only be called once, so we check if any apps are already initialized
if (!admin.apps.length) {
  let credential;
  
  // Use Firebase Service Account Key JSON if provided
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Fallback: Using default credentials (from GOOGLE_APPLICATION_CREDENTIALS)
    credential = admin.credential.applicationDefault();
  }

  if (credential) {
    admin.initializeApp({
      credential: credential,
    });
  } else {
    admin.initializeApp();
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export const updateStreak = async (userId: string) => {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) return null;
  
  const userData = userDoc.data();
  const lastLoginAt = userData?.lastLoginAt?.toDate() || new Date(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastLoginDate = new Date(lastLoginAt);
  lastLoginDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastLoginDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Kemarin login, nambah streak
    await userRef.update({
      active_days_streak: admin.firestore.FieldValue.increment(1),
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  } else if (diffDays > 1 || !userData?.active_days_streak) {
    // Bolong, reset ke 1
    await userRef.update({
      active_days_streak: 1,
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  } else if (diffDays === 0) {
    // Udah update hari ini, cuma update timestamp detik
    await userRef.update({
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  }
  
  const updated = await userRef.get();
  return updated.data();
};

export { adminDb, adminAuth };

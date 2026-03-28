import * as admin from 'firebase-admin';

// Polyfill location for serverless environments
if (typeof globalThis.location === 'undefined') {
  (globalThis as Record<string, unknown>).location = {
    hostname: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost',
    href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    protocol: 'https:',
  };
}

// Singleton pattern for serverless environments
let adminApp: admin.app.App | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

function initializeAdmin(): { db: admin.firestore.Firestore; auth: admin.auth.Auth } {
  if (adminApp) {
    return { db: adminDb!, auth: adminAuth! };
  }

  if (!admin.apps.length) {
    let credential;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
        throw new Error('Invalid Firebase service account configuration');
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    } else {
      throw new Error('Firebase credentials not configured');
    }

    adminApp = admin.initializeApp({
      credential: credential,
    });
  } else {
    adminApp = admin.apps[0]!;
  }

  adminDb = adminApp.firestore();
  adminAuth = adminApp.auth();

  return { db: adminDb, auth: adminAuth };
}

export function getAdminDb(): admin.firestore.Firestore {
  return initializeAdmin().db;
}

export function getAdminAuth(): admin.auth.Auth {
  return initializeAdmin().auth;
}

export const updateStreak = async (userId: string) => {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
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
    await userRef.update({
      active_days_streak: admin.firestore.FieldValue.increment(1),
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  } else if (diffDays > 1 || !userData?.active_days_streak) {
    await userRef.update({
      active_days_streak: 1,
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  } else if (diffDays === 0) {
    await userRef.update({
      lastLoginAt: admin.firestore.Timestamp.now()
    });
  }
  
  const updated = await userRef.get();
  return updated.data();
};

export interface ActionLinkResult {
  oobLink: string;
  oobCode: string;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function extractOobCode(link: string): string {
  try {
    const url = new URL(link);
    return url.searchParams.get("oobCode") || "";
  } catch {
    return "";
  }
}

export async function generatePasswordResetLink(email: string): Promise<ActionLinkResult> {
  const auth = getAdminAuth() as {
    generatePasswordResetLink(email: string, options?: { url?: string; handleCodeInApp?: boolean }): Promise<string>;
  };
  const appUrl = getAppUrl();
  
  const link = await auth.generatePasswordResetLink(email, {
    url: `${appUrl}/auth/action`,
    handleCodeInApp: false,
  });
  
  const oobCode = extractOobCode(link);
  const finalLink = `${appUrl}/auth/action?mode=resetPassword&oobCode=${oobCode}`;
  
  return { oobLink: finalLink, oobCode };
}

export async function generateEmailVerificationLink(email: string): Promise<ActionLinkResult> {
  const auth = getAdminAuth() as {
    generateEmailVerificationLink(email: string, options?: { url?: string; handleCodeInApp?: boolean }): Promise<string>;
  };
  const appUrl = getAppUrl();
  
  const link = await auth.generateEmailVerificationLink(email, {
    url: `${appUrl}/auth/action`,
    handleCodeInApp: false,
  });
  
  const oobCode = extractOobCode(link);
  const finalLink = `${appUrl}/auth/action?mode=verifyEmail&oobCode=${oobCode}`;
  
  return { oobLink: finalLink, oobCode };
}

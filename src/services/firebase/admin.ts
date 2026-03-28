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

// Auth action handlers for Vercel serverless functions
export interface ActionCodeResult {
  email?: string;
  previousEmail?: string;
  newEmail?: string;
}

export async function verifyActionCode(oobCode: string): Promise<ActionCodeResult> {
  const auth = getAdminAuth() as unknown as Record<string, Function>;
  const actionCode = await (auth.verifyActionCode as (code: string) => Promise<Record<string, unknown>>)(oobCode);
  return {
    email: actionCode.email as string,
    previousEmail: actionCode.previousEmail as string,
    newEmail: actionCode.newEmail as string,
  };
}

export async function applyActionCode(oobCode: string): Promise<admin.auth.UserRecord> {
  const auth = getAdminAuth() as unknown as Record<string, Function>;
  return (auth.applyActionCode as (code: string) => Promise<admin.auth.UserRecord>)(oobCode);
}

export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  const auth = getAdminAuth();
  return auth.getUserByEmail(email);
}

export async function updateUserPassword(uid: string, newPassword: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.updateUser(uid, { password: newPassword });
}

export async function updateUserEmail(uid: string, email: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.updateUser(uid, { email });
}

export async function updateUserEmailVerified(uid: string, verified: boolean): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    emailVerified: verified,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

export async function updateUserEmailInFirestore(uid: string, email: string): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    email: email,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

export interface ActionLinkResult {
  oobLink: string;
  oobCode: string;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function generatePasswordResetLink(email: string): Promise<ActionLinkResult> {
  const auth = getAdminAuth();
  const appUrl = getAppUrl();
  
  const link = await auth.generatePasswordResetLink(email, {
    url: `${appUrl}/auth/action?mode=resetPassword`,
    handleCodeInApp: true,
  });
  
  const oobCode = extractOobCode(link);
  return { oobLink: link, oobCode };
}

export async function generateEmailVerificationLink(email: string): Promise<ActionLinkResult> {
  const auth = getAdminAuth();
  const appUrl = getAppUrl();
  
  const link = await auth.generateSignInWithEmailLink(email, {
    url: `${appUrl}/auth/action?mode=verifyEmail`,
    handleCodeInApp: true,
  });
  
  const oobCode = extractOobCode(link);
  return { oobLink: link, oobCode };
}

function extractOobCode(link: string): string {
  try {
    const url = new URL(link);
    return url.searchParams.get("oobCode") || "";
  } catch {
    return "";
  }
}

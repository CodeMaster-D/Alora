import { getAdminAuth, getAdminDb } from "@/services/firebase/admin";
import { UserPreferencesSchema, UserProfileSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function verifyAuthToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch {
    throw new Error("Unauthorized or invalid token");
  }
}

export async function getUserPreferences(userId: string) {
  const db = getAdminDb();
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data()?.preferences || null;
}

export async function updateUserPreferences(userId: string, data: unknown) {
  const validated = UserPreferencesSchema.parse(data);

  const db = getAdminDb();
  await db.collection("users").doc(userId).set(
    { preferences: validated },
    { merge: true }
  );

  return validated;
}

export async function updateUserProfile(userId: string, data: unknown) {
  const validated = UserProfileSchema.parse(data);
  
  const profileUpdate = { ...validated };
  if (validated.dateOfBirth) {
    (profileUpdate as Record<string, unknown>).dateOfBirth = admin.firestore.Timestamp.fromDate(new Date(validated.dateOfBirth as string));
  }

  const db = getAdminDb();
  await db.collection("users").doc(userId).set(
    { profile: profileUpdate },
    { merge: true }
  );

  return profileUpdate;
}

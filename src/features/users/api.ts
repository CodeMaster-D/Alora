import { adminAuth, adminDb } from "@/services/firebase/admin";
import { UserPreferencesSchema, UserProfileSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function verifyAuthToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error("Unauthorized or invalid token");
  }
}

export async function getUserPreferences(userId: string) {
  const doc = await adminDb.collection("users").doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data()?.preferences || null;
}

export async function updateUserPreferences(userId: string, data: any) {
  const validated = UserPreferencesSchema.parse(data);

  // Partial update using deep maps via set with merge
  await adminDb.collection("users").doc(userId).set(
    { preferences: validated },
    { merge: true }
  );

  return validated;
}

export async function updateUserProfile(userId: string, data: any) {
  const validated = UserProfileSchema.parse(data);
  
  // Example checking if birthDate comes in as string to convert to Timestamp
  let profileUpdate = { ...validated };
  if (validated.dateOfBirth) {
    (profileUpdate as any).dateOfBirth = admin.firestore.Timestamp.fromDate(new Date(validated.dateOfBirth));
  }

  await adminDb.collection("users").doc(userId).set(
    { profile: profileUpdate },
    { merge: true }
  );

  return profileUpdate;
}

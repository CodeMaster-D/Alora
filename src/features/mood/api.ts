import { getAdminDb } from "@/services/firebase/admin";
import { MoodSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function addMoodEntry(userId: string, data: unknown) {
  const validated = MoodSchema.parse(data);

  const entry = {
    userId,
    ...validated,
    mood: Math.floor(validated.mood),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const db = getAdminDb();
  const docRef = await db.collection("moods").add(entry);

  return { id: docRef.id, ...entry };
}

export async function getMoodEntries(userId: string) {
  const db = getAdminDb();
  const snapshot = await db
    .collection("moods")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

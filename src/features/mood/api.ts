import { adminDb } from "@/services/firebase/admin";
import { MoodSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function addMoodEntry(userId: string, data: any) {
  const validated = MoodSchema.parse(data);

  const entry = {
    userId,
    ...validated,
    mood: Math.floor(validated.mood), // Guaranteed Integer
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await adminDb.collection("moods").add(entry);

  return { id: docRef.id, ...entry };
}

export async function getMoodEntries(userId: string) {
  const snapshot = await adminDb
    .collection("moods")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

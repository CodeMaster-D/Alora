import { adminDb } from "@/services/firebase/admin";
import { JournalSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function addJournalEntry(userId: string, data: any) {
  const validated = JournalSchema.parse(data);

  const entry = {
    userId,
    ...validated,
    mood: validated.mood ? Math.floor(validated.mood) : null,
    // Size bytes validation cast logic correctly follows int64 rule using Zod .int() internally
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await adminDb.collection("journals").add(entry);

  return { id: docRef.id, ...entry };
}

export async function getJournals(userId: string) {
  const snapshot = await adminDb
    .collection("journals")
    .where("userId", "==", userId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

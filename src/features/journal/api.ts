import { getAdminDb } from "@/services/firebase/admin";
import { JournalSchema } from "@/types/schemas";
import * as admin from "firebase-admin";

export async function addJournalEntry(userId: string, data: unknown) {
  const validated = JournalSchema.parse(data);

  const entry = {
    userId,
    ...validated,
    mood: validated.mood ? Math.floor(validated.mood) : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const db = getAdminDb();
  const docRef = await db.collection("journals").add(entry);

  return { id: docRef.id, ...entry };
}

export async function getJournals(userId: string) {
  const db = getAdminDb();
  const snapshot = await db
    .collection("journals")
    .where("userId", "==", userId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

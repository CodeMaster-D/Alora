import { 
  User, 
  UserPreferences, 
  MoodEntry, 
  JournalEntry, 
  BreathingExercise,
  ApiResponse,
  LoginForm,
  RegisterForm,
  JournalForm,
  MoodForm
} from "@/types";
import { auth, db } from "./firebase/client";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile as updateAuthProfile,
  updatePassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  applyActionCode,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  addDoc
} from "firebase/firestore";

// Interface khusus untuk statistik
export interface MoodStats {
  totalEntries: number;
  avgMood: number;
  moodCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  factorCounts: Record<string, number>;
}

// Helper to handle Firestore Timestamp, Date objects, or date strings
const parseDate = (date: Timestamp | Date | string | null | undefined): Date => {
  if (!date) return new Date();
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  // Duck-type check for Firestore Timestamp-like objects (e.g. serialised from SSR)
  const maybe = date as unknown as { toDate?: () => Date };
  if (typeof maybe.toDate === 'function') return maybe.toDate();
  return new Date(date as string);
};

// --- AUTH SERVICE ---
export const authService = {
  login: async (data: LoginForm): Promise<ApiResponse<User>> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const fbUser = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (!userDoc.exists()) throw new Error("User document not found");
      
      const userData = userDoc.data() as User;
      return { 
        success: true, 
        data: { 
          ...userData, 
          emailVerified: fbUser.emailVerified 
        } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  loginWithGoogle: async (): Promise<ApiResponse<User>> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || "",
          photoURL: fbUser.photoURL || undefined,
          emailVerified: fbUser.emailVerified,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: "system", 
            highContrast: false, 
            fontSize: "medium", 
            fontFamily: "default",
            reducedMotion: false, 
            notifications: true, 
            reminderTime: "09:00",
          },
          active_days_streak: 1,
        };
        await setDoc(doc(db, "users", fbUser.uid), newUser);
        return { success: true, data: newUser };
      }
      return { success: true, data: userDoc.data() as User };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  register: async (data: RegisterForm): Promise<ApiResponse<User>> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const fbUser = userCredential.user;
      
      await updateAuthProfile(fbUser, { displayName: data.displayName });
      
      const newUser: User = {
        id: fbUser.uid,
        email: data.email,
        displayName: data.displayName,
        emailVerified: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: "system", 
          highContrast: false, 
          fontSize: "medium", 
          fontFamily: "default",
          reducedMotion: false, 
          notifications: true, 
          reminderTime: "09:00",
        },
        active_days_streak: 1,
      };
      
      await setDoc(doc(db, "users", fbUser.uid), newUser);
      return { success: true, data: newUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    try {
      const fbUser = await new Promise<any>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
          unsubscribe();
          resolve(u);
        });
      });
      if (!fbUser) return { success: true, data: null };

      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (!userDoc.exists()) return { success: true, data: null };
      return { success: true, data: userDoc.data() as User };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, data);
      const updated = await getDoc(userRef);
      return { success: true, data: updated.data() as User };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updatePreferences: async (userId: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
    try {
      const userRef = doc(db, "users", userId);
      
      // Use dot notation to update specific nested fields without overwriting the whole preferences map
      const updates: any = {};
      Object.entries(preferences).forEach(([key, value]) => {
        updates[`preferences.${key}`] = value;
      });
      
      await updateDoc(userRef, updates);
      const updated = await getDoc(userRef);
      return { success: true, data: (updated.data() as User).preferences };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updatePassword: async (newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("No user logged in");
      await updatePassword(fbUser, newPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteAccount: async (): Promise<ApiResponse<void>> => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("No user logged in");
      
      // Delete user doc first (security rules should allow it if auth matching)
      await deleteDoc(doc(db, "users", fbUser.uid));
      
      // Then delete auth account
      await deleteUser(fbUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateDailyStreak: async (): Promise<ApiResponse<{ streak: number }>> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch("/api/user/streak", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      return { success: true, data: { streak: data.streak } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  sendVerificationEmail: async (): Promise<ApiResponse<void>> => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("No user logged in");
      
      if (fbUser.emailVerified) {
        return { success: false, error: "Email already verified" };
      }
      
      await sendEmailVerification(fbUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  verifyEmail: async (actionCode: string): Promise<ApiResponse<void>> => {
    try {
      await applyActionCode(auth, actionCode);
      
      const fbUser = auth.currentUser;
      if (fbUser) {
        await updateDoc(doc(db, "users", fbUser.uid), { emailVerified: true });
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  checkEmailVerified: async (): Promise<ApiResponse<boolean>> => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("No user logged in");
      return { success: true, data: fbUser.emailVerified };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  sendPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// --- MOOD SERVICE ---
export const moodService = {
  getMoodEntries: async (userId: string): Promise<ApiResponse<MoodEntry[]>> => {
    try {
      const q = query(collection(db, "moods"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const entries: MoodEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({ 
          ...data, 
          id: docSnap.id,
          timestamp: parseDate(data.timestamp) 
        } as MoodEntry);
      });
      // Sort client-side and ensure it's a valid Date for sorting
      return { 
        success: true, 
        data: entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  addMoodEntry: async (userId: string, data: MoodForm): Promise<ApiResponse<MoodEntry>> => {
    try {
      const timestamp = new Date();
      const docRef = await addDoc(collection(db, "moods"), {
        userId,
        ...data,
        timestamp,
      });
      return { 
        success: true, 
        data: { id: docRef.id, userId, ...data, timestamp } as MoodEntry 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateMoodEntry: async (entryId: string, data: Partial<MoodForm>): Promise<ApiResponse<MoodEntry>> => {
    try {
      const ref = doc(db, "moods", entryId);
      await updateDoc(ref, data);
      const updated = await getDoc(ref);
      const entryData = updated.data();
      return { 
        success: true, 
        data: { ...entryData, id: updated.id, timestamp: parseDate(entryData?.timestamp) } as MoodEntry 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteMoodEntry: async (entryId: string): Promise<ApiResponse<void>> => {
    try {
      await deleteDoc(doc(db, "moods", entryId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getMoodStats: async (userId: string, days: number = 30): Promise<ApiResponse<MoodStats>> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Only filter by userId to avoid composite index requirement;
      // date range is applied client-side.
      const q = query(collection(db, "moods"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const entries: MoodEntry[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ts = parseDate(data.timestamp);
        // Client-side date range filter
        if (ts >= startDate) {
          entries.push({ ...data, id: docSnap.id, timestamp: ts } as MoodEntry);
        }
      });

      const totalEntries = entries.length;
      const avgMood = totalEntries > 0
        ? entries.reduce((s, e) => s + e.mood, 0) / totalEntries
        : 0;
      
      const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const factorCounts: Record<string, number> = {};

      entries.forEach(e => {
        const val = e.mood as keyof typeof moodCounts;
        if (moodCounts[val] !== undefined) moodCounts[val]++;
        e.factors?.forEach(f => {
          factorCounts[f] = (factorCounts[f] || 0) + 1;
        });
      });

      return {
        success: true,
        data: { totalEntries, avgMood: Math.round(avgMood * 10) / 10, moodCounts, factorCounts }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// --- JOURNAL SERVICE ---
export const journalService = {
  getJournalEntries: async (userId: string): Promise<ApiResponse<JournalEntry[]>> => {
    try {
      const q = query(collection(db, "journals"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const entries: JournalEntry[] = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        entries.push({ 
          ...data, 
          id: d.id,
          timestamp: parseDate(data.timestamp),
          updatedAt: parseDate(data.updatedAt)
        } as JournalEntry);
      });
      return { 
        success: true, 
        data: entries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getJournalEntry: async (entryId: string): Promise<ApiResponse<JournalEntry>> => {
    try {
      const docSnap = await getDoc(doc(db, "journals", entryId));
      if (!docSnap.exists()) return { success: false, error: "Journal not found" };
      const data = docSnap.data();
      return { 
        success: true, 
        data: { 
          ...data, 
          id: docSnap.id,
          timestamp: parseDate(data.timestamp),
          updatedAt: parseDate(data.updatedAt)
        } as JournalEntry 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  addJournalEntry: async (userId: string, data: JournalForm): Promise<ApiResponse<JournalEntry>> => {
    try {
      const timestamp = new Date();
      const docRef = await addDoc(collection(db, "journals"), {
        userId,
        ...data,
        timestamp,
        updatedAt: timestamp
      });
      return { 
        success: true, 
        data: { id: docRef.id, userId, ...data, timestamp, updatedAt: timestamp } as JournalEntry 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateJournalEntry: async (entryId: string, data: Partial<JournalForm>): Promise<ApiResponse<JournalEntry>> => {
    try {
      const ref = doc(db, "journals", entryId);
      const updatedAt = new Date();
      await updateDoc(ref, { ...data, updatedAt });
      
      const docSnap = await getDoc(ref);
      const entryData = docSnap.data();
      return { 
        success: true, 
        data: { 
          ...entryData, 
          id: ref.id,
          timestamp: parseDate(entryData?.timestamp),
          updatedAt: parseDate(entryData?.updatedAt)
        } as JournalEntry 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteJournalEntry: async (entryId: string): Promise<ApiResponse<void>> => {
    try {
      await deleteDoc(doc(db, "journals", entryId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  searchJournalEntries: async (userId: string, searchQuery: string): Promise<ApiResponse<JournalEntry[]>> => {
    try {
      // NOTE: Firestore doesn't support built-in text search easily. You usually need Algolia/ElasticSearch.
      // We will perform client-side filtering after retrieving user queries to simplify.
      const q = query(collection(db, "journals"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const entries: JournalEntry[] = [];
      const sq = searchQuery.toLowerCase();

      querySnapshot.forEach((d) => {
        const data = d.data();
        if (data.title?.toLowerCase().includes(sq) || data.content?.toLowerCase().includes(sq)) {
          entries.push({ 
            ...data, 
            id: d.id,
            timestamp: parseDate(data.timestamp),
            updatedAt: parseDate(data.updatedAt)
          } as JournalEntry);
        }
      });
      return { success: true, data: entries.sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// --- BREATHING SERVICE ---
export const breathingService = {
  getBreathingExercises: async (): Promise<ApiResponse<BreathingExercise[]>> => {
    try {
      const response = await fetch("/api/breathing/exercises");
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      return { success: true, data: data.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getBreathingExercise: async (id: string): Promise<ApiResponse<BreathingExercise>> => {
    try {
      const docSnap = await getDoc(doc(db, "breathing_exercises", id));
      if (!docSnap.exists()) return { success: false, error: "Not found" };
      return { success: true, data: { ...docSnap.data(), id: docSnap.id } as BreathingExercise };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  saveBreathingSession: async (userId: string, exerciseId: string): Promise<ApiResponse<void>> => {
    try {
      await addDoc(collection(db, "breathing_sessions"), {
        userId,
        exerciseId,
        timestamp: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getBreathingSessions: async (userId: string): Promise<ApiResponse<{ id: string; userId: string; exerciseId: string; timestamp: Date }[]>> => {
    try {
      const q = query(
        collection(db, "breathing_sessions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
        timestamp: parseDate(d.data().timestamp)
      })) as { id: string; userId: string; exerciseId: string; timestamp: Date }[];
      return { 
        success: true, 
        data: sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// --- CONTACT SERVICE ---
export const contactService = {
  sendMessage: async (data: { email: string; name?: string; message: string }): Promise<ApiResponse<void>> => {
    try {
      await addDoc(collection(db, "contact_messages"), {
        ...data,
        createdAt: new Date(),
        status: "new",
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export const firebaseService = {
  auth: authService,
  mood: moodService,
  journal: journalService,
  breathing: breathingService,
  contact: contactService,
};
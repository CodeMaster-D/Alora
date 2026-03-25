import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * ALORA CORE SCHEMA - 2026 REVISION
 * Standards: Next.js 16 / React 19 / FSD
 */

// --- 1. USERS ---
export interface AloraUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Timestamp | FieldValue;
  lastLoginAt: Timestamp | FieldValue;
  provider: 'email' | 'google' | 'apple';
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Timestamp;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    phone?: string;
    timezone: string;
    language: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large'; // Map to OpenDyslexic/Atkinson
    notifications: {
      email: boolean;
      push: boolean;
      moodReminders: boolean;
      sessionReminders: boolean;
      weeklyReports: boolean;
    };
    accessibility: {
      highContrast: boolean;
      reduceMotion: boolean;
      screenReader: boolean;
      largeText: boolean;
    };
  };
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate?: Timestamp;
    stripeCustomerId?: string;
  };
}

// --- 2. MOODS ---
export interface MoodEntry {
  userId: string;
  mood: number; // Integer (1-5)
  emotion: string;
  emoji: string;
  color: string;
  triggers: string[]; // Array-contains queryable
  activities: string[];
  notes: string;
  timestamp: Timestamp | FieldValue;
  location?: {
    latitude: number; // Double
    longitude: number; // Double
  };
  weather?: {
    temperature: number; // Double
    condition: string;
    humidity: number; // Double
  };
}

// --- 3. JOURNALS ---
export interface JournalEntry {
  userId: string;
  title: string;
  content: string;
  mood?: number; // Integer (1-5)
  tags: string[];
  isPrivate: boolean;
  attachments: {
    type: 'image' | 'audio' | 'document';
    url: string;
    name: string;
    size: number; // Integer (Bytes)
  }[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// --- 4. THERAPY SESSIONS ---
export interface TherapySession {
  userId: string;
  therapistId: string;
  type: 'individual' | 'group' | 'couples';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduledFor: Timestamp;
  duration: number; // Integer (Minutes)
  sessionUrl?: string;
  notes?: string;
  rating?: number; // Integer (1-5)
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// --- 5. RESOURCES ---
export interface Resource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast' | 'exercise' | 'meditation';
  category: string;
  tags: string[];
  thumbnailUrl: string;
  contentUrl: string;
  duration?: number; // Integer (Minutes)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;
  viewCount: number; // Integer (incrementable)
  rating: number; // Double (Average)
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// --- 6. APPOINTMENTS ---
export interface Appointment {
  userId: string;
  title: string;
  description: string;
  type: 'therapy' | 'checkup' | 'medication' | 'other';
  scheduledFor: Timestamp;
  duration: number; // Integer
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  reminders: {
    type: 'email' | 'push' | 'sms';
    time: Timestamp;
    sent: boolean;
  }[];
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// --- 7. ANALYTICS ---
export interface UserAnalytics {
  userId: string;
  type: 'mood_pattern' | 'session_attendance' | 'resource_usage' | 'app_usage';
  data: {
    period: 'daily' | 'weekly' | 'monthly';
    metrics: Record<string, any>; // Nested Maps
    trends: Record<string, number>; // Double percentages
  };
  generatedAt: Timestamp | FieldValue;
}
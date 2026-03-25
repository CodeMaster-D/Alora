import { z } from "zod";

// Zod schemas that mirror the interfaces in src/types/firestore.ts

// --- 1. USERS ---
export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    moodReminders: z.boolean().default(true),
    sessionReminders: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
  }).default({
    email: true,
    push: true,
    moodReminders: true,
    sessionReminders: true,
    weeklyReports: true,
  }),
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    reduceMotion: z.boolean().default(false),
    screenReader: z.boolean().default(false),
    largeText: z.boolean().default(false),
  }).default({
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    largeText: false,
  }),
});

export const UserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // For dates arriving in REST payloads, we accept strings and parse them to Dates/Timestamps in the feature layer
  dateOfBirth: z.string().optional(), 
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  phone: z.string().optional(),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
});

export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  provider: z.enum(["email", "google", "apple"]),
  profile: UserProfileSchema.default({
    timezone: "UTC",
    language: "en",
  }),
  preferences: UserPreferencesSchema.default({
    theme: "system",
    fontSize: "medium",
    notifications: {
      email: true,
      push: true,
      moodReminders: true,
      sessionReminders: true,
      weeklyReports: true,
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      largeText: false,
    },
  }),
});

// --- 2. MOODS ---
export const MoodSchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotion: z.string(),
  emoji: z.string(),
  color: z.string(),
  triggers: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  notes: z.string().default(""),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  weather: z.object({
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
  }).optional(),
});

// --- 3. JOURNALS ---
export const JournalSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  mood: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(true),
  attachments: z.array(
    z.object({
      type: z.enum(["image", "audio", "document"]),
      url: z.string().url(),
      name: z.string(),
      size: z.number().int(),
    })
  ).default([]),
});

// --- 4. THERAPY SESSIONS ---
export const TherapySessionSchema = z.object({
  therapistId: z.string(),
  type: z.enum(["individual", "group", "couples"]),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
  scheduledFor: z.string(), // ISO String
  duration: z.number().int().min(1),
  sessionUrl: z.string().url().optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded"]),
});

// --- 6. APPOINTMENTS ---
export const AppointmentSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  type: z.enum(["therapy", "checkup", "medication", "other"]),
  scheduledFor: z.string(), // ISO String
  duration: z.number().int().min(1),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().url().optional(),
  reminders: z.array(
    z.object({
      type: z.enum(["email", "push", "sms"]),
      time: z.string(), // ISO String
      sent: z.boolean().default(false),
    })
  ).default([]),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

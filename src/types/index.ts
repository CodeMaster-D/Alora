// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
  active_days_streak?: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  highContrast: boolean;
  fontSize: "small" | "medium" | "large" | "extra-large";
  fontFamily: "default" | "dyslexic" | "hyperlegible";
  reducedMotion: boolean;
  notifications: boolean;
  reminderTime: string;
}

// Mood Tracking Types
export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-5 scale
  factors: string[];
  note?: string;
  timestamp: Date;
}

export interface MoodFactor {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Journal Types
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  tags: string[];
  mood?: number;
  timestamp: Date;
  updatedAt: Date;
}

// Breathing Exercise Types
export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleTime: number; // in seconds
  holdTime: number; // in seconds
  exhaleTime: number; // in seconds
  cycles: number;
  icon: string;
  color: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface JournalForm {
  title: string;
  content: string;
  isPrivate: boolean;
  tags: string[];
  mood?: number;
}

export interface MoodForm {
  mood: number;
  factors: string[];
  note?: string;
}

// Component Props Types
export interface AccessibilityToolbarProps {
  className?: string;
}

export interface MoodCardProps {
  mood: MoodEntry;
  className?: string;
}

export interface JournalCardProps {
  entry: JournalEntry;
  className?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface BreathingExerciseCardProps {
  exercise: BreathingExercise;
  onStart: (exercise: BreathingExercise) => void;
  className?: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  isActive?: boolean;
}
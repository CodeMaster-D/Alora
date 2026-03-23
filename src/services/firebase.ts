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

// Interface khusus untuk statistik agar tidak kena error "unexpected any"
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

// --- MOCK DATA ---
const mockUsers: User[] = [
  {
    id: "user-1",
    email: "user@example.com",
    displayName: "Alex Johnson",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    createdAt: new Date("2023-01-15"),
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
  },
];

const mockMoodEntries: MoodEntry[] = [
  {
    id: "mood-1",
    userId: "user-1",
    mood: 4,
    factors: ["exercise", "social"],
    note: "Had a great day at the park with friends!",
    timestamp: new Date("2023-06-15T10:30:00"),
  },
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: "journal-1",
    userId: "user-1",
    title: "My First Journal Entry",
    content: "Today I decided to start journaling to help process my thoughts and emotions.",
    isPrivate: false,
    tags: ["beginnings", "hopeful"],
    mood: 4,
    timestamp: new Date("2023-06-10T09:00:00"),
    updatedAt: new Date("2023-06-10T09:00:00"),
  },
];

const mockBreathingExercises: BreathingExercise[] = [
  {
    id: "breathing-1",
    name: "Box Breathing",
    description: "A simple technique to help regulate breathing and reduce stress.",
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 5,
    icon: "square",
    color: "#889E81",
  },
];

// --- AUTH SERVICE ---
export const authService = {
  login: async (data: LoginForm): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) return { success: false, error: "Invalid email or password" };
    return { success: true, data: user };
  },
  
  register: async (data: RegisterForm): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) return { success: false, error: "User already exists" };
    
    const newUser: User = {
      id: `user-${mockUsers.length + 1}`,
      email: data.email,
      displayName: data.displayName,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        theme: "system", highContrast: false, fontSize: "medium", fontFamily: "default",
        reducedMotion: false, notifications: true, reminderTime: "09:00",
      },
    };
    mockUsers.push(newUser);
    return { success: true, data: newUser };
  },

  logout: async (): Promise<ApiResponse<void>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },

  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: mockUsers[0] };
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: "User not found" };
    mockUsers[index] = { ...mockUsers[index], ...data };
    return { success: true, data: mockUsers[index] };
  },

  updatePreferences: async (userId: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: "User not found" };
    mockUsers[index].preferences = { ...mockUsers[index].preferences, ...preferences };
    return { success: true, data: mockUsers[index].preferences };
  },
};

// --- MOOD SERVICE ---
export const moodService = {
  getMoodEntries: async (userId: string): Promise<ApiResponse<MoodEntry[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, data: mockMoodEntries.filter(e => e.userId === userId) };
  },

  addMoodEntry: async (userId: string, data: MoodForm): Promise<ApiResponse<MoodEntry>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newEntry: MoodEntry = {
      id: `mood-${mockMoodEntries.length + 1}`,
      userId,
      mood: data.mood,
      factors: data.factors,
      note: data.note,
      timestamp: new Date(),
    };
    mockMoodEntries.push(newEntry);
    return { success: true, data: newEntry };
  },

  updateMoodEntry: async (entryId: string, data: Partial<MoodForm>): Promise<ApiResponse<MoodEntry>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const index = mockMoodEntries.findIndex(e => e.id === entryId);
    if (index === -1) return { success: false, error: "Mood entry not found" };
    if (data.mood !== undefined) mockMoodEntries[index].mood = data.mood;
    if (data.factors) mockMoodEntries[index].factors = data.factors;
    if (data.note !== undefined) mockMoodEntries[index].note = data.note;
    return { success: true, data: mockMoodEntries[index] };
  },

  deleteMoodEntry: async (entryId: string): Promise<ApiResponse<void>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockMoodEntries.findIndex(e => e.id === entryId);
    if (index === -1) return { success: false, error: "Mood entry not found" };
    mockMoodEntries.splice(index, 1);
    return { success: true };
  },

  getMoodStats: async (userId: string, days: number = 30): Promise<ApiResponse<MoodStats>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = mockMoodEntries.filter(e => e.userId === userId && e.timestamp >= startDate);
    const totalEntries = entries.length;
    const avgMood = totalEntries > 0 ? entries.reduce((s, e) => s + e.mood, 0) / totalEntries : 0;
    
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(e => {
      const val = e.mood as keyof typeof moodCounts;
      if (moodCounts[val] !== undefined) moodCounts[val]++;
    });

    const factorCounts: Record<string, number> = {};
    entries.forEach(e => {
      e.factors.forEach(f => factorCounts[f] = (factorCounts[f] || 0) + 1);
    });

    return {
      success: true,
      data: { totalEntries, avgMood: Math.round(avgMood * 10) / 10, moodCounts, factorCounts }
    };
  },
};

// --- JOURNAL SERVICE ---
export const journalService = {
  getJournalEntries: async (userId: string): Promise<ApiResponse<JournalEntry[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, data: mockJournalEntries.filter(e => e.userId === userId) };
  },

  getJournalEntry: async (entryId: string): Promise<ApiResponse<JournalEntry>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const entry = mockJournalEntries.find(e => e.id === entryId);
    if (!entry) return { success: false, error: "Journal not found" };
    return { success: true, data: entry };
  },

  addJournalEntry: async (userId: string, data: JournalForm): Promise<ApiResponse<JournalEntry>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newEntry: JournalEntry = {
      id: `journal-${mockJournalEntries.length + 1}`,
      userId, ...data, timestamp: new Date(), updatedAt: new Date(),
    };
    mockJournalEntries.push(newEntry);
    return { success: true, data: newEntry };
  },

  updateJournalEntry: async (entryId: string, data: Partial<JournalForm>): Promise<ApiResponse<JournalEntry>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const index = mockJournalEntries.findIndex(e => e.id === entryId);
    if (index === -1) return { success: false, error: "Journal not found" };
    mockJournalEntries[index] = { ...mockJournalEntries[index], ...data, updatedAt: new Date() };
    return { success: true, data: mockJournalEntries[index] };
  },

  deleteJournalEntry: async (entryId: string): Promise<ApiResponse<void>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockJournalEntries.findIndex(e => e.id === entryId);
    if (index === -1) return { success: false, error: "Journal not found" };
    mockJournalEntries.splice(index, 1);
    return { success: true };
  },

  searchJournalEntries: async (userId: string, query: string): Promise<ApiResponse<JournalEntry[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const q = query.toLowerCase();
    const results = mockJournalEntries.filter(e => 
      e.userId === userId && (e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q))
    );
    return { success: true, data: results };
  },
};

// --- BREATHING SERVICE ---
export const breathingService = {
  getBreathingExercises: async (): Promise<ApiResponse<BreathingExercise[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: mockBreathingExercises };
  },

  getBreathingExercise: async (id: string): Promise<ApiResponse<BreathingExercise>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const ex = mockBreathingExercises.find(e => e.id === id);
    return ex ? { success: true, data: ex } : { success: false, error: "Not found" };
  },
};

export const firebaseService = {
  auth: authService,
  mood: moodService,
  journal: journalService,
  breathing: breathingService,
};
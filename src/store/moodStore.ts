import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MoodEntry, MoodForm } from "@/types";
import { firebaseService } from "@/services/firebase";

interface MoodState {
  moodEntries: MoodEntry[];
  isLoading: boolean;
  
  // Actions
  fetchMoodEntries: (userId: string) => Promise<void>;
  addMoodEntry: (userId: string, data: MoodForm) => Promise<boolean>;
  updateMoodEntry: (entryId: string, data: Partial<MoodForm>) => Promise<boolean>;
  deleteMoodEntry: (entryId: string) => Promise<boolean>;
  setMoodEntries: (entries: MoodEntry[]) => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      moodEntries: [],
      isLoading: false,
      
      fetchMoodEntries: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.mood.getMoodEntries(userId);
          
          if (response.success && response.data) {
            set({ 
              moodEntries: response.data, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Fetch mood entries error:", error);
          set({ isLoading: false });
        }
      },
      
      addMoodEntry: async (userId: string, data: MoodForm) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.mood.addMoodEntry(userId, data);
          
          if (response.success && response.data) {
            set(state => ({ 
              moodEntries: [response.data!, ...state.moodEntries], 
              isLoading: false 
            }));
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Add mood entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      updateMoodEntry: async (entryId: string, data: Partial<MoodForm>) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.mood.updateMoodEntry(entryId, data);
          
          if (response.success && response.data) {
            set(state => ({
              moodEntries: state.moodEntries.map(entry => 
                entry.id === entryId ? response.data! : entry
              ),
              isLoading: false
            }));
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Update mood entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      deleteMoodEntry: async (entryId: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.mood.deleteMoodEntry(entryId);
          
          if (response.success) {
            set(state => ({
              moodEntries: state.moodEntries.filter(entry => entry.id !== entryId),
              isLoading: false
            }));
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Delete mood entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      setMoodEntries: (entries: MoodEntry[]) => {
        set({ moodEntries: entries });
      },
    }),
    {
      name: "mood-storage",
    }
  )
);
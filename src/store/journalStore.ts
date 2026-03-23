import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JournalEntry, JournalForm } from "@/types";
import { firebaseService } from "@/services/firebase";

interface JournalState {
  journalEntries: JournalEntry[];
  isLoading: boolean;
  
  // Actions
  fetchJournalEntries: (userId: string) => Promise<void>;
  addJournalEntry: (userId: string, data: JournalForm) => Promise<boolean>;
  updateJournalEntry: (entryId: string, data: Partial<JournalForm>) => Promise<boolean>;
  deleteJournalEntry: (entryId: string) => Promise<boolean>;
  setJournalEntries: (entries: JournalEntry[]) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      journalEntries: [],
      isLoading: false,
      
      fetchJournalEntries: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.journal.getJournalEntries(userId);
          
          if (response.success && response.data) {
            // Sort by date, newest first
            const sortedEntries = [...response.data].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            
            set({ 
              journalEntries: sortedEntries, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Fetch journal entries error:", error);
          set({ isLoading: false });
        }
      },
      
      addJournalEntry: async (userId: string, data: JournalForm) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.journal.addJournalEntry(userId, data);
          
          if (response.success && response.data) {
            set(state => ({ 
              journalEntries: [response.data!, ...state.journalEntries], 
              isLoading: false 
            }));
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Add journal entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      updateJournalEntry: async (entryId: string, data: Partial<JournalForm>) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.journal.updateJournalEntry(entryId, data);
          
          if (response.success && response.data) {
            set(state => ({
              journalEntries: state.journalEntries.map(entry => 
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
          console.error("Update journal entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      deleteJournalEntry: async (entryId: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.journal.deleteJournalEntry(entryId);
          
          if (response.success) {
            set(state => ({
              journalEntries: state.journalEntries.filter(entry => entry.id !== entryId),
              isLoading: false
            }));
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Delete journal entry error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      setJournalEntries: (entries: JournalEntry[]) => {
        set({ journalEntries: entries });
      },
    }),
    {
      name: "journal-storage",
    }
  )
);
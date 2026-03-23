import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { firebaseService } from ".././services/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<User["preferences"]>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.login({ email, password });
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.register({ 
            email, 
            password, 
            displayName, 
            confirmPassword: password 
          });
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Registration error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await firebaseService.auth.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error) {
          console.error("Logout error:", error);
          set({ isLoading: false });
        }
      },
      
      updateUser: async (data) => {
        const { user } = get();
        
        if (!user) return false;
        
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.updateProfile(user.id, data);
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isLoading: false 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Update profile error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      updatePreferences: async (preferences) => {
        const { user } = get();
        
        if (!user) return false;
        
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.updatePreferences(user.id, preferences);
          
          if (response.success && response.data) {
            set({ 
              user: { 
                ...user, 
                preferences: { ...user.preferences, ...response.data } 
              }, 
              isLoading: false 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Update preferences error:", error);
          set({ isLoading: false });
          return false;
        }
      },
      
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.getCurrentUser();
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Check auth error:", error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
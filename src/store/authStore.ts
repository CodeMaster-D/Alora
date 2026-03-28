import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { firebaseService } from "../services/firebase";
import { auth } from "@/services/firebase/client";
import { getIdToken } from "firebase/auth";

// Helper untuk set dan hapus cookie (agar terbaca oleh Middleware)
const setAuthCookie = (value: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `isAuthenticated=${value}; path=/; max-age=86400; SameSite=Lax`;
  }
};

const removeAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerificationSent: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean }>;
  loginWithGoogle: () => Promise<boolean>; 
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; verificationSent?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<User["preferences"]>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  updateStreak: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ success: boolean; rateLimited?: boolean }>;
  checkEmailVerified: () => Promise<boolean>;
  reloadAndSyncVerification: () => Promise<boolean>;
  syncEmailVerifiedToFirestore: (userId: string) => Promise<boolean>;
  clearVerificationSent: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      emailVerificationSent: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.login({ email, password });
          
          if (response.success && response.data) {
            const needsVerification = response.data.emailVerified === false;
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
            setAuthCookie('true');
            return { success: true, needsVerification };
          } else {
            set({ isLoading: false });
            return { success: false };
          }
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          return { success: false };
        }
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true });
        
        try {
          const response = await firebaseService.auth.loginWithGoogle();
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
            // Set Cookie pas login Google sukses
            setAuthCookie('true');
            return true;
          } else {
            console.error("Google Login error:", response.error);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("Google Login exception:", error);
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
            setAuthCookie('true');

            try {
              const emailResponse = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "verification",
                  email: email,
                  name: displayName,
                }),
              });
              const emailData = await emailResponse.json();
              
              if (!emailData.success) {
                console.error("Verification email failed:", emailData.error);
              }
              
              set({ emailVerificationSent: emailData.success });
              return { success: true, verificationSent: emailData.success };
            } catch (emailError) {
              console.error("Verification email error:", emailError);
              set({ emailVerificationSent: false });
              return { success: true, verificationSent: false };
            }
          } else {
            set({ isLoading: false });
            return { success: false };
          }
        } catch (error) {
          console.error("Registration error:", error);
          set({ isLoading: false });
          return { success: false };
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
          // Hapus Cookie pas logout
          removeAuthCookie();
          
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("journal-storage");
            window.localStorage.removeItem("mood-storage");
          }
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
          
          if (response.success) {
            if (response.data) {
              set({ 
                user: response.data, 
                isAuthenticated: true, 
                isLoading: false 
              });
              setAuthCookie('true');
            } else {
              set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
              });
              removeAuthCookie();
            }
          } else {
            console.warn("Check auth failed with error from Firebase, ignoring to prevent unwanted logout:", response.error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Check auth exception:", error);
          set({ isLoading: false });
        }

        // Jalankan update streak setelah auth check selesai
        if (get().isAuthenticated) {
          get().updateStreak();
        }
      },

      updateStreak: async () => {
        try {
          const response = await firebaseService.auth.updateDailyStreak();
          if (response.success && response.data) {
            const { user } = get();
            if (user) {
              set({ 
                user: { ...user, active_days_streak: response.data.streak } 
              });
            }
          }
        } catch (error) {
          console.error("Failed to update streak:", error);
        }
      },

      sendVerificationEmail: async (): Promise<{ success: boolean; rateLimited?: boolean }> => {
        try {
          const { user } = get();
          if (!user) return { success: false };

          const response = await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "verification",
              email: user.email,
              name: user.displayName,
            }),
          });

          const data = await response.json();

          if (data.success) {
            set({ emailVerificationSent: true });
            return { success: true };
          }
          if (data.error?.includes("too-many-requests") || data.error?.includes("quota")) {
            return { success: false, rateLimited: true };
          }
          return { success: false };
        } catch (error) {
          console.error("Send verification email error:", error);
          return { success: false };
        }
      },

      checkEmailVerified: async () => {
        try {
          const response = await firebaseService.auth.checkEmailVerified();
          if (response.success && response.data !== undefined) {
            const { user } = get();
            if (user) {
              set({ user: { ...user, emailVerified: response.data } });
            }
            return response.data;
          }
          return false;
        } catch (error) {
          console.error("Check email verified error:", error);
          return false;
        }
      },

      syncEmailVerifiedToFirestore: async (userId: string) => {
        try {
          const fbUser = auth.currentUser;
          if (!fbUser) return false;
          
          const idToken = await getIdToken(fbUser);
          
          const response = await fetch("/api/auth/action", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              mode: "syncVerification",
              userId
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            const { user } = get();
            if (user && data.emailVerified) {
              set({ user: { ...user, emailVerified: true } });
            }
            return true;
          }
          return false;
        } catch (error) {
          console.error("Sync email verified error:", error);
          return false;
        }
      },

      reloadAndSyncVerification: async () => {
        try {
          console.log("[AuthStore] Reloading current user...");
          const response = await firebaseService.auth.reloadCurrentUser();
          console.log("[AuthStore] Reload response:", response);
          
          if (response.success && response.data !== undefined) {
            const { user } = get();
            console.log("[AuthStore] Current user:", user?.id, "emailVerified:", response.data);
            if (user) {
              const updatedUser = { ...user, emailVerified: response.data };
              set({ user: updatedUser });
              
              if (response.data) {
                console.log("[AuthStore] Syncing verification to Firestore...");
                await get().syncEmailVerifiedToFirestore(user.id);
              }
            }
            return response.data;
          }
          console.log("[AuthStore] Reload failed, returning false");
          return false;
        } catch (error) {
          console.error("Reload and sync error:", error);
          return false;
        }
      },

      clearVerificationSent: () => {
        set({ emailVerificationSent: false });
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
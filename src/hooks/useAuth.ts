/*import { useState, useEffect, useCallback } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateEmail as firebaseUpdateEmail,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  UserCredential,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { UserProfile } from "@/types";

interface UseAuthReturn {
  // User state
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Profile management
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Password management
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Session management
  refreshUser: () => Promise<void>;
  reauthenticate: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export function useAuth(): UseAuthReturn {
  const { 
    user, 
    userProfile, 
    setUser, 
    setUserProfile, 
    clearAuth,
    set isLoading 
  } = useAuthStore();
  
  const [authLoading, setAuthLoading] = useState(true);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            
            // Update last login
            await updateDoc(userDocRef, {
              lastLoginAt: serverTimestamp(),
            });
          } else {
            // Create user profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              emailVerified: firebaseUser.emailVerified,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
              subscription: {
                plan: "free",
                status: "active",
                startDate: new Date(),
              },
              preferences: {
                theme: "light",
                language: "en",
                notifications: {
                  email: true,
                  push: true,
                  sms: false,
                },
                privacy: {
                  profileVisibility: "private",
                  dataSharing: false,
                },
              },
              onboarding: {
                completed: false,
                step: 0,
              },
            };
            
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        // User is signed out
        clearAuth();
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, clearAuth]);

  // Email/Password Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An error occurred during sign in";
      
      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Email/Password Sign Up
  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An error occurred during sign up";
      
      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Google Sign In
  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An error occurred during Google sign in";
      
      switch (authError.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign in was cancelled";
          break;
        case "auth/popup-blocked":
          errorMessage = "Pop-up was blocked by the browser";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Sign in was cancelled";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Facebook Sign In
  const signInWithFacebook = useCallback(async () => {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope("email");
      provider.addScope("public_profile");
      
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An error occurred during Facebook sign in";
      
      switch (authError.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign in was cancelled";
          break;
        case "auth/popup-blocked":
          errorMessage = "Pop-up was blocked by the browser";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage = "An account already exists with the same email but different sign-in method";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Apple Sign In
  const signInWithApple = useCallback(async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An error occurred during Apple sign in";
      
      switch (authError.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign in was cancelled";
          break;
        case "auth/popup-blocked":
          errorMessage = "Pop-up was blocked by the browser";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage = "An account already exists with the same email but different sign-in method";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      clearAuth();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [clearAuth]);

  // Update User Profile
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...data,
          updatedAt: new Date(),
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  }, [user, userProfile, setUserProfile]);

  // Update Display Name
  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      await updateProfile(user, { displayName });
      
      // Update Firestore profile
      await updateUserProfile({ displayName });
      
      // Refresh user
      await user.reload();
      setUser(auth.currentUser);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating display name:", error);
      return { success: false, error: "Failed to update display name" };
    }
  }, [user, setUser, updateUserProfile]);

  // Update Email
  const updateEmail = useCallback(async (email: string, password: string) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await firebaseUpdateEmail(user, email);
      
      // Update Firestore profile
      await updateUserProfile({ email, emailVerified: false });
      
      // Refresh user
      await user.reload();
      setUser(auth.currentUser);
      
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Failed to update email";
      
      switch (authError.code) {
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Email is already in use";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/requires-recent-login":
          errorMessage = "Please sign in again to update your email";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, [user, setUser, updateUserProfile]);

  // Update Password
  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await firebaseUpdatePassword(user, newPassword);
      
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Failed to update password";
      
      switch (authError.code) {
        case "auth/wrong-password":
          errorMessage = "Incorrect current password";
          break;
        case "auth/weak-password":
          errorMessage = "New password is too weak";
          break;
        case "auth/requires-recent-login":
          errorMessage = "Please sign in again to update your password";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Failed to send password reset email";
      
      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh User
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      await user.reload();
      setUser(auth.currentUser);
      
      // Refresh profile from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, [user, setUser, setUserProfile]);

  // Reauthenticate User
  const reauthenticate = useCallback(async (password: string) => {
    if (!user || !user.email) return { success: false, error: "No user logged in" };
    
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Reauthentication failed";
      
      switch (authError.code) {
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  }, [user]);

  return {
    // User state
    user,
    userProfile,
    isLoading: authLoading,
    isAuthenticated: !!user,
    
    // Authentication methods
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signOut,
    
    // Profile management
    updateProfile: updateUserProfile,
    updateDisplayName,
    updateEmail,
    updatePassword,
    
    // Password management
    resetPassword,
    
    // Session management
    refreshUser,
    reauthenticate,
  };
}
  */
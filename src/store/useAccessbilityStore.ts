import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessibilityState {
  theme: "light" | "dark" | "system";
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
  fontFamily: "default" | "dyslexic" | "hyperlegible";
  reducedMotion: boolean;
  screenReader: boolean;
  
  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleHighContrast: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  setFontFamily: (font: "default" | "dyslexic" | "hyperlegible") => void;
  toggleReducedMotion: () => void;
  toggleScreenReader: () => void;
  resetSettings: () => void;
}

const initialState = {
  theme: "system" as const,
  highContrast: false,
  fontSize: "medium" as const,
  fontFamily: "default" as const,
  reducedMotion: false,
  screenReader: false,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      
      setFontSize: (fontSize) => set({ fontSize }),
      
      setFontFamily: (fontFamily) => set({ fontFamily }),
      
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      
      toggleScreenReader: () => set((state) => ({ screenReader: !state.screenReader })),
      
      resetSettings: () => set(initialState),
    }),
    {
      name: "accessibility-storage",
    }
  )
);
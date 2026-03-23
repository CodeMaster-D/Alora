import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessibilityState {
  theme: "light" | "dark" | "system";
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
  fontFamily: "default" | "dyslexic" | "hyperlegible";
  reducedMotion: boolean;
  screenReader: boolean;
  language: string; // <-- Tambah ini
  
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleHighContrast: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  setFontFamily: (font: "default" | "dyslexic" | "hyperlegible") => void;
  toggleReducedMotion: () => void;
  toggleScreenReader: () => void;
  setLanguage: (lang: string) => void; // <-- Tambah ini
  resetSettings: () => void;
}

const initialState = {
  theme: "system" as const,
  highContrast: false,
  fontSize: "medium" as const,
  fontFamily: "default" as const,
  reducedMotion: false,
  screenReader: false,
  language: "id-ID", // <-- Default Indonesia
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      toggleScreenReader: () => set((state) => ({ screenReader: !state.screenReader })),
      setLanguage: (language) => set({ language }), // <-- Implementasi setLanguage
      resetSettings: () => set(initialState),
    }),
    {
      name: "accessibility-storage",
    }
  )
);
"use client";

import { useEffect, useRef } from "react";
import { useAccessibilityStore } from "@/store/useAccessbilityStore"; 
import { useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";

export function AccessibilityManager({ children }: { children: React.ReactNode }) {
  const settings = useAccessibilityStore();
  const { setTheme } = useTheme();
  const lastSpokenRef = useRef<string>("");

  useEffect(() => {
    const root = window.document.documentElement;

    // Sinkronisasi Tema
    if (settings.theme) setTheme(settings.theme);

    // Atribut untuk CSS Selector
    root.setAttribute("data-font-size", settings.fontSize);
    root.setAttribute("data-font-family", settings.fontFamily);
    root.setAttribute("data-high-contrast", settings.highContrast.toString());
    root.setAttribute("data-reduced-motion", settings.reducedMotion.toString());

    // Logic Screen Reader
    const handleMouseOver = (e: MouseEvent) => {
      if (!settings.screenReader) return;
      const target = e.target as HTMLElement;
      const textToSpeak = target.ariaLabel || target.innerText || target.title;
      
      if (textToSpeak && textToSpeak !== lastSpokenRef.current && textToSpeak.trim() !== "") {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = settings.language; 
        window.speechSynthesis.speak(utterance);
        lastSpokenRef.current = textToSpeak;
      }
    };

    if (settings.screenReader) {
      document.addEventListener("mouseover", handleMouseOver);
    }

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [settings, setTheme]);

  return (
    <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
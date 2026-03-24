"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import BreathePage from "../app/breathe/page";
import { useAccessibilityStore } from "@/store/useAccessbilityStore";
import { useEffect } from "react";

export default function LandingPage() {
  const { fontFamily, fontSize, highContrast, reducedMotion } = useAccessibilityStore();

  // Sinkronisasi data-attributes ke HTML tag agar Global CSS lo bekerja
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-font-family", fontFamily || "hyperlegible");
    root.setAttribute("data-font-size", fontSize || "medium");
    root.setAttribute("data-high-contrast", highContrast ? "true" : "false");
    root.setAttribute("data-reduced-motion", reducedMotion ? "true" : "false");
  }, [fontFamily, fontSize, highContrast, reducedMotion]);

  return (
    // Kita pakai @apply bg-background dari CSS base, jadi cukup "bg-background"
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300">
      <Navbar />
      
      {/* Wrapper untuk sections agar ada spacing yang konsisten */}
      <div className="flex flex-col gap-0">
        <Hero />
        
        {/* Section About */}
        <div id="about" className="bg-secondary/5">
          <About />
        </div>

        {/* Breathe Page sebagai Section - Kita bungkus agar style-nya masuk ke landing */}
        <section id="breathe" className="py-20 bg-background">
           <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-atkinson font-bold tracking-tight">Experience Alora</h2>
                <p className="text-foreground/60 mt-4">Try our signature breathing ritual right here.</p>
              </div>
              <BreathePage />
           </div>
        </section>

        <Contact />
      </div>
    </main>
  );
}
"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { DashboardSection } from "@/components/landing/dashboard"; // Import jagoan baru kita
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import BreathePage from "../app/breathe/page";
import { useAccessibilityStore } from "@/store/useAccessbilityStore";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { fontFamily, fontSize, highContrast, reducedMotion } = useAccessibilityStore();

  // Sinkronisasi data-attributes ke HTML tag agar Global CSS bekerja
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-font-family", fontFamily || "hyperlegible");
    root.setAttribute("data-font-size", fontSize || "medium");
    root.setAttribute("data-high-contrast", highContrast ? "true" : "false");
    root.setAttribute("data-reduced-motion", reducedMotion ? "true" : "false");
  }, [fontFamily, fontSize, highContrast, reducedMotion]);

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300">
      <Navbar />
      
      {/* Container utama tanpa gap berlebih agar transisi section mulus */}
      <article className="flex flex-col">
        
        {/* 1. Hero Section */}
        <Hero />
        
        {/* 2. Section About (Introduction) */}
        <section id="about" className="bg-secondary/5 border-y border-border/50">
          <About />
        </section>

        {/* 3. Section Dashboard (Visual & 3D Analytics) */}
        <DashboardSection />

        {/* 4. Breathe Page (Interactive Demo) */}
        <section id="breathe" className="py-24 bg-background relative">
          <div className="container mx-auto px-6">
            <header className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-atkinson font-bold tracking-tight text-foreground">
                Experience Alora
              </h2>
              <p className="text-foreground/60 mt-4 text-lg md:text-xl font-medium">
                Try our signature breathing ritual right here.
              </p>
            </header>
            
            {/* Komponen demo breathing */}
            <BreathePage isDemo={true} />
          </div>
        </section>

        {/* 5. Contact & Footer */}
        <Contact />
        <Footer />
        
      </article>

      {/* Utilities */}
      <ScrollToTop />
    </main>
  );
}
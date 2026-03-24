"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wind, Heart, BookOpen } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">
            Digital Wellness Reimagined
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl font-medium tracking-tight mb-6"
        >
          Your Journey to <br />
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Inner Peace
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/50 mb-10 leading-relaxed"
        >
          Alora helps you balance your digital life through mindful breathing, 
          reflective journaling, and emotional tracking. All in one beautiful space.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth/register">
            <Button size="lg" className="rounded-2xl h-14 px-8 text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
              Start Your Ritual
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="ghost" className="rounded-2xl h-14 px-8 text-lg border border-white/10 backdrop-blur-md hover:bg-white/5">
              Explore Alora
            </Button>
          </Link>
        </motion.div>

        {/* Floating Feature Icons */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto opacity-40">
           {[Wind, Heart, BookOpen].map((Icon, i) => (
             <motion.div
               key={i}
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
               className="flex flex-col items-center gap-2"
             >
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                 <Icon className="h-6 w-6" />
               </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import { Wind, Heart, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Mindful Breathing",
    desc: "Science-backed patterns to reduce stress instantly.",
    icon: Wind,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Emotional Intelligence",
    desc: "Track your moods and discover what drives your feelings.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Instant Clarity",
    desc: "A clutter-free space designed for deep reflection.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Privacy First",
    desc: "Your data is encrypted and stays yours forever.",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

export function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
            Designed for the <br /> modern mind.
          </h2>
          <p className="text-foreground/50 text-lg">
            We believe that mental wellness should be as beautiful as it is functional. 
            Alora is built to be your digital sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[32px] bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-sm transition-all"
            >
              <div className={cn("p-3 w-fit rounded-2xl mb-6", f.bg)}>
                <f.icon className={cn("h-6 w-6", f.color)} />
              </div>
              <h3 className="text-xl font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
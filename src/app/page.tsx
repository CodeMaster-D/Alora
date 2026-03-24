"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BookOpen, Wind, BarChart3, Shield, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-md rounded-[28px] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#D48C70]/40",
    className
  )}>
    {children}
  </Card>
);

export default function HomePage() {
  const features = [
    { icon: Heart, title: "Mood Tracking", description: "Track your daily mood and identify patterns to better understand your emotional wellbeing." },
    { icon: BookOpen, title: "Journaling", description: "Express your thoughts and feelings in a private journal with voice-to-text support." },
    { icon: Wind, title: "Breathing Exercises", description: "Practice guided breathing exercises to reduce stress and improve focus." },
    { icon: BarChart3, title: "Analytics", description: "Visualize your mental health trends and progress over time with insightful charts." },
    { icon: Shield, title: "Privacy First", description: "Your data is encrypted and secure. You have full control over your information." },
    { icon: Users, title: "Accessibility", description: "Designed with accessibility in mind, including dyslexic fonts and high contrast modes." },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background text-left">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Mental Health <span className="text-[#D48C70]">Companion</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl font-medium italic leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Alora is a mental health and accessibility web app designed to support your wellbeing journey.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild className="h-14 rounded-full px-10 text-base font-bold bg-[#D48C70] hover:bg-[#D48C70]/90 shadow-xl shadow-[#D48C70]/20 transition-all active:scale-95">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" asChild className="h-14 rounded-full px-10 text-base font-bold border-white/20 bg-white/40 hover:bg-white/60 backdrop-blur-md transition-all active:scale-95">
              <Link href="/auth/login">Sign In to Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="mb-16 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard className="h-full p-8 group">
                  <div className="w-14 h-14 rounded-[20px] bg-[#D48C70]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#D48C70] transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-[#D48C70] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-foreground/60 font-medium leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
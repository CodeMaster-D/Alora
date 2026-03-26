"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  BookOpen,
  Wind,
  TrendingUp,
  Plus,
  Smile,
  Frown,
  Meh,
  Activity,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MoodEntry } from "@/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { firebaseService } from "@/services/firebase";

// --- KONFIGURASI MOOD ---
const MOOD_EMOJIS: { [key: number]: string } = {
  1: "😢", 2: "😔", 3: "😐", 4: "😊", 5: "😄",
};

// --- GLASSMORPHISM WRAPPER (Sesuai Global CSS & Analytics) ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/80 dark:bg-white/10 backdrop-blur-3xl border border-white/60 dark:border-white/20 rounded-[32px] overflow-hidden transition-all duration-500",
    className
  )}>
    {children}
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [breathingCount, setBreathingCount] = useState(0);
  const [chartData, setChartData] = useState<{ date: string; mood: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [moodResponse, journalResponse, breathingResponse] = await Promise.all([
          firebaseService.mood.getMoodEntries(user.id),
          firebaseService.journal.getJournalEntries(user.id),
          firebaseService.breathing.getBreathingSessions(user.id)
        ]);
        
        if (moodResponse.success && moodResponse.data) {
          const allMoods = moodResponse.data;
          setRecentMoods(allMoods.slice(0, 5));
          
          const sortedAsc = [...allMoods].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          const formattedData = sortedAsc.map(entry => ({
            date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            mood: entry.mood,
          }));
          setChartData(formattedData);
        }

        if (journalResponse.success && journalResponse.data) {
          setJournalCount(journalResponse.data.length);
        }

        if (breathingResponse.success && breathingResponse.data) {
          setBreathingCount(breathingResponse.data.length);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getMoodIcon = (mood: number) => {
    switch (mood) {
      case 1: case 2: return <Frown className="h-5 w-5" strokeWidth={1.5} />;
      case 3: return <Meh className="h-5 w-5" strokeWidth={1.5} />;
      case 4: case 5: return <Smile className="h-5 w-5" strokeWidth={1.5} />;
      default: return <Meh className="h-5 w-5" strokeWidth={1.5} />;
    }
  };

  const getMoodColorClass = (mood: number) => {
    switch (mood) {
      case 1: return "text-rose-500 bg-rose-500/10";
      case 2: return "text-orange-500 bg-orange-500/10";
      case 3: return "text-amber-500 bg-amber-500/10";
      case 4: return "text-emerald-500 bg-emerald-500/10";
      case 5: return "text-indigo-500 bg-indigo-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto min-h-screen text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-foreground/50 font-medium italic">
            Welcome back! Here&apos;s your mental health overview.
          </p>
        </div>
        <Button className="rounded-[20px] h-12 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all font-medium border-none" asChild>
          <Link href="/journal/new">
            <Plus className="mr-2 h-5 w-5" />
            New Entry
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 bg-foreground/10" />
                  <Skeleton className="h-8 w-8 rounded-xl bg-foreground/10" />
                </div>
                <Skeleton className="h-10 w-24 bg-foreground/10" />
                <Skeleton className="h-3 w-32 bg-foreground/5" />
              </GlassCard>
            </motion.div>
          ))
        ) : (
          [
            { title: "Mood Today", val: recentMoods[0]?.mood ? `${recentMoods[0].mood}/5` : "N/A", sub: recentMoods[0] ? `Logged at ${new Date(recentMoods[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No entry", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", emoji: MOOD_EMOJIS[recentMoods[0]?.mood] },
            { title: "Journal Entries", val: journalCount.toString(), sub: "Total entries", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Breathing", val: breathingCount.toString(), sub: "Sessions tracked", icon: Wind, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { title: "Streak", val: `${user?.active_days_streak || 0} Days`, sub: "Daily streak", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" }
          ].map((item, i) => (
            <motion.div key={`stat-${i}`} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }}>
              <GlassCard>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 font-bold">{item.title}</span>
                    <div className={`p-2 ${item.bg} rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-medium flex items-baseline gap-2">
                    {item.val}
                    {item.emoji && <span className="text-xl opacity-90">{item.emoji}</span>}
                  </div>
                  <p className="text-xs font-medium text-foreground/30 mt-1">{item.sub}</p>
                </CardContent>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2" variants={itemVariants} initial="hidden" animate="visible">
          <GlassCard className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary/60" />
                Mood Trajectory
              </CardTitle>
              <CardDescription className="text-xs font-medium text-foreground/40">30-day emotional trend</CardDescription>
            </CardHeader>
            <CardContent className={cn("h-[350px] pt-4", isLoading && "flex items-center justify-center")}>
              {isLoading ? (
                <div className="flex flex-col items-center gap-6">
                  <LoadingSpinner size="lg" text="Analyzing trends..." />
                  <div className="w-full flex items-end justify-between px-10 h-32 gap-2">
                    {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <Skeleton key={i} className="w-full rounded-t-lg bg-foreground/5" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.4 }} dy={10} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.4 }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(30px)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
                      />
                      <Area type="monotone" dataKey="mood" stroke="var(--color-primary)" strokeWidth={3} fill="url(#colorMood)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Recent History */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <GlassCard className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary/60" />
                Recent History
              </CardTitle>
              <CardDescription className="text-xs font-medium text-foreground/40">Your latest emotional logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={`hist-skeleton-${i}`} className="flex items-center gap-4 p-2">
                      <Skeleton className="h-11 w-11 rounded-2xl bg-foreground/10" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24 bg-foreground/10" />
                        <Skeleton className="h-3 w-full max-w-[120px] bg-foreground/5" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentMoods.map((entry) => (
                    <div key={entry.id} className="group flex items-center justify-between p-3 rounded-[24px] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={cn("p-2.5 rounded-2xl shadow-sm", getMoodColorClass(entry.mood))}>
                          {getMoodIcon(entry.mood)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold tracking-tight">
                            {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                             <span className="truncate max-w-[120px]">{entry.factors.join(" • ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-foreground/5 px-2.5 py-1 rounded-full">
                        {entry.mood}/5 <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription className="text-xs font-medium text-foreground/40 tracking-tight">Tools to maintain your mental balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { href: "/mood", icon: Heart, label: "Log Mood", desc: "How are you now?", color: "text-rose-500", bg: "bg-rose-500/5" },
                { href: "/journal/new", icon: BookOpen, label: "Journal", desc: "Reflect on today", color: "text-blue-500", bg: "bg-blue-500/5" },
                { href: "/breathe", icon: Wind, label: "Breathe", desc: "Reset your mind", color: "text-emerald-500", bg: "bg-emerald-500/5" }
              ].map((action, idx) => (
                <Button key={idx} variant="ghost" className="h-auto p-8 rounded-[32px] flex flex-col items-center space-y-4 bg-white/40 dark:bg-white/5 border border-white/20 hover:border-white/60 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.03]" asChild>
                  <Link href={action.href}>
                    <div className={cn("p-4 rounded-3xl", action.bg)}>
                      <action.icon className={cn("h-8 w-8", action.color)} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <div className="text-base font-semibold">{action.label}</div>
                      <div className="text-[11px] font-medium text-foreground/40">{action.desc}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
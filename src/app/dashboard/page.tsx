"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  BookOpen,
  Wind,
  Calendar,
  TrendingUp,
  Plus,
  Smile,
  Frown,
  Meh,
  Activity,
  Zap,
  ChevronRight
} from "lucide-react";
// --- IMPORT RECHARTS ---
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/types";
import { cn } from "@/lib/utils";

// --- KONFIGURASI MOOD ---
const MOOD_EMOJIS: { [key: number]: string } = {
  1: "😢", 2: "😔", 3: "😐", 4: "😊", 5: "😄",
};

const MOOD_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#10b981", 5: "#6366f1",
};

// --- GLASSMOPHISM WRAPPER ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] overflow-hidden transition-all duration-300",
    className
  )}>
    {children}
  </Card>
);

// --- HELPER: GENERATE DUMMY DATA (No Logic Change) ---
const generateDummyMoodEntries = (days: number): MoodEntry[] => {
  const data: MoodEntry[] = [];
  const today = new Date();
  const factorsList = [["Work"], ["Sleep"], ["Exercise"], ["Social"], ["Family"], ["Work", "Stress"]];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomMood = Math.floor(Math.random() * 5) + 1;
    data.push({
      id: `dummy-${i}`,
      userId: "user-dummy",
      mood: randomMood,
      timestamp: date.toISOString(),
      factors: factorsList[Math.floor(Math.random() * factorsList.length)],
      notes: "This is a dummy note",
      createdAt: date.toISOString(),
    });
  }
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function DashboardPage() {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<{ date: string; mood: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const dummyEntries = generateDummyMoodEntries(30);
        setRecentMoods(dummyEntries.slice(0, 5));
        const sortedAsc = [...dummyEntries].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const formattedData = sortedAsc.map(entry => ({
          date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          mood: entry.mood,
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-12 w-12 rounded-2xl bg-primary/20 backdrop-blur-xl border border-primary/20"
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-foreground/50 font-medium italic">
            Welcome back! Here&apos;s your mental health overview.
          </p>
        </div>
        <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-medium" asChild>
          <a href="/journal/new">
            <Plus className="mr-2 h-5 w-5" />
            New Entry
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Mood Today", val: recentMoods[0]?.mood ? `${recentMoods[0].mood}/5` : "N/A", sub: recentMoods[0] ? `Logged at ${new Date(recentMoods[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No entry", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", emoji: MOOD_EMOJIS[recentMoods[0]?.mood] },
          { title: "Journal Entries", val: "12", sub: "+3 from last month", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Breathing", val: "8", sub: "Sessions this week", icon: Wind, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Streak", val: "5 Days", sub: "Keep the momentum!", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }}>
            <GlassCard>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 font-medium">{item.title}</span>
                  <div className={`p-2 ${item.bg} rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-medium flex items-baseline gap-2">
                  {item.val}
                  {item.emoji && <span className="text-xl">{item.emoji}</span>}
                </div>
                <p className="text-xs font-medium text-foreground/30 mt-1">{item.sub}</p>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Chart - Styled like Analytics Page */}
        <motion.div className="lg:col-span-2" variants={itemVariants} initial="hidden" animate="visible">
          <GlassCard>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary/60" />
                Mood Trajectory
              </CardTitle>
              <CardDescription className="text-xs font-medium text-foreground/40">30-day emotional trend</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.4 }} dy={10} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.4 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
                  />
                  <Area type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={3} fill="url(#colorMood)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Recent Moods - More informative */}
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
              <div className="space-y-5">
                {recentMoods.map((entry) => (
                  <div key={entry.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/40 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={cn("p-2.5 rounded-xl", getMoodColorClass(entry.mood))}>
                        {getMoodIcon(entry.mood)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                          {entry.factors.join(" • ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {entry.mood}/5 <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions - Liquid Style */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription className="text-xs font-medium text-foreground/40 tracking-tight">Tools to maintain your mental balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { href: "/mood/new", icon: Heart, label: "Log Mood", desc: "How are you now?", color: "text-rose-500" },
                { href: "/journal/new", icon: BookOpen, label: "Journal", desc: "Reflect on today", color: "text-blue-500" },
                { href: "/breathe", icon: Wind, label: "Breathe", desc: "Reset your mind", color: "text-emerald-500" }
              ].map((action, idx) => (
                <Button key={idx} variant="ghost" className="h-auto p-6 rounded-[24px] flex flex-col items-center space-y-3 bg-white/20 hover:bg-white/60 dark:bg-white/5 border border-white/20 transition-all hover:scale-[1.02]" asChild>
                  <a href={action.href}>
                    <action.icon className={cn("h-8 w-8", action.color)} strokeWidth={1.5} />
                    <div className="text-center">
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-[10px] text-foreground/40">{action.desc}</div>
                    </div>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
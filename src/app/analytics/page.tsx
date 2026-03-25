"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  Heart, 
  Smile, 
  Zap, 
  Activity,
  ChartLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { firebaseService } from "@/services/firebase";
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---
interface MoodData {
  date: string;
  mood: number;
  emotion: string;
  triggers: string[];
  activities: string[];
}

interface AnalyticsData {
  logs: MoodData[];
  patterns: {
    bestDay: string;
    worstDay: string;
    averageMood: number;
    improvement: number;
  };
  moodCounts: Record<number, number>;
  factorCounts: Record<string, number>;
  weekdayAvgs: { day: string; mood: number }[];
}

const MOOD_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#10b981", 5: "#6366f1",
};

const MOOD_EMOJIS: Record<number, string> = {
  1: "😢", 2: "😔", 3: "😐", 4: "😊", 5: "😄",
};

const MOOD_LABELS: Record<number, string> = {
  1: "Very Sad", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Very Happy",
};

// --- Custom Components ---
// Diupdate menyesuaikan global.css biar gak nabrak, pakai white dengan opacity biar jadi glassmorphism cerah
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/80 dark:bg-white/10 backdrop-blur-3xl border border-white/60 dark:border-white/20 rounded-[32px] overflow-hidden transition-all duration-500",
    className
  )}>
    {children}
  </Card>
);

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalyticsData = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const [statsRes, entriesRes] = await Promise.all([
        firebaseService.mood.getMoodStats(user.id, days),
        firebaseService.mood.getMoodEntries(user.id)
      ]);

      if (statsRes.success && statsRes.data && entriesRes.success && entriesRes.data) {
        const stats = statsRes.data;
        const entries = entriesRes.data;

        const now = new Date();
        const rangeDate = new Date();
        rangeDate.setDate(now.getDate() - days);
        
        const filteredEntries = entries.filter(e => {
          const d = new Date(e.timestamp);
          return d >= rangeDate && d <= now;
        });

        const logs: MoodData[] = filteredEntries
          .map(e => ({
            date: new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            mood: e.mood,
            emotion: e.mood >= 4 ? 'happy' : e.mood <= 2 ? 'sad' : 'neutral',
            triggers: e.factors || [],
            activities: [],
          }))
          .reverse();

        let improvement = 0;
        if (logs.length >= 2) {
          const mid = Math.floor(logs.length / 2);
          const firstHalf = logs.slice(0, mid);
          const secondHalf = logs.slice(mid);
          const avg1 = firstHalf.reduce((s, x) => s + x.mood, 0) / firstHalf.length;
          const avg2 = secondHalf.reduce((s, x) => s + x.mood, 0) / secondHalf.length;
          improvement = avg1 > 0 ? Math.round(((avg2 - avg1) / avg1) * 100) : 0;
        }

        const weekdayMoods: Record<number, number[]> = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[]};
        filteredEntries.forEach(e => {
          const day = new Date(e.timestamp).getDay();
          weekdayMoods[day].push(e.mood);
        });

        const weekdayAvgs = Object.entries(weekdayMoods).map(([day, moods]) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
          mood: moods.length > 0 ? Math.round((moods.reduce((s, m) => s + m, 0) / moods.length) * 10) / 10 : 0
        }));

        const validDays = weekdayAvgs.filter(d => d.mood > 0);
        let bestDay = "N/A";
        let worstDay = "N/A";
        if (validDays.length > 0) {
          bestDay = [...validDays].sort((a, b) => b.mood - a.mood)[0].day;
          worstDay = [...validDays].sort((a, b) => a.mood - b.mood)[0].day;
        }

        setAnalyticsData({
          logs,
          patterns: {
            bestDay,
            worstDay,
            averageMood: stats.avgMood,
            improvement,
          },
          moodCounts: stats.moodCounts,
          factorCounts: stats.factorCounts,
          weekdayAvgs: weekdayAvgs
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchAnalyticsData();
    }
  }, [timeRange, mounted, user, fetchAnalyticsData]);

  const currentData = useMemo(() => {
    return analyticsData?.logs || [];
  }, [analyticsData]);

  const moodDistribution = useMemo(() => {
    if (!analyticsData) return [];
    const counts = analyticsData.moodCounts;
    return [
      { name: 'Very Sad', value: counts[1] || 0, color: MOOD_COLORS[1] },
      { name: 'Sad', value: counts[2] || 0, color: MOOD_COLORS[2] },
      { name: 'Neutral', value: counts[3] || 0, color: MOOD_COLORS[3] },
      { name: 'Happy', value: counts[4] || 0, color: MOOD_COLORS[4] },
      { name: 'Very Happy', value: counts[5] || 0, color: MOOD_COLORS[5] },
    ];
  }, [analyticsData]);

  const activitiesData = useMemo(() => {
    if (!analyticsData) return [];
    return Object.entries(analyticsData.factorCounts).map(([name, count]) => ({
      name,
      count,
      positiveImpact: 1.5, 
    })).slice(0, 4);
  }, [analyticsData]);

  if (!mounted) return null;

  // Render Skeleton State dengan GlassCard yang udah nyatu sama global.css
  if (isLoading || !analyticsData) {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-10">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 rounded-2xl bg-foreground/10" />
            <Skeleton className="h-4 w-56 rounded-lg bg-foreground/5" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-12 w-32 rounded-2xl bg-foreground/10" />
             <Skeleton className="h-12 w-12 rounded-2xl bg-foreground/10" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="h-36">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 bg-foreground/10" />
                  <Skeleton className="h-8 w-8 rounded-xl bg-foreground/10" />
                </div>
                <Skeleton className="h-10 w-24 bg-foreground/10" />
                <Skeleton className="h-3 w-32 bg-foreground/5" />
              </CardContent>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2 bg-foreground/10" />
              <Skeleton className="h-4 w-60 bg-foreground/5" />
            </CardHeader>
            <CardContent className="h-[350px] w-full pt-4 flex flex-col justify-end gap-4 px-8 pb-6">
               <div className="flex items-end justify-between h-full w-full pb-4 border-b border-foreground/10">
                 {[40, 70, 45, 90, 65, 80, 30, 60, 85, 50, 75, 40].map((h, i) => (
                   <Skeleton 
                     key={i} 
                     className="w-1.5 rounded-full bg-primary/40" 
                     style={{ height: `${h}%`, opacity: (i % 2 === 0) ? 0.7 : 0.4 }} 
                   />
                 ))}
               </div>
               <div className="flex justify-between w-full px-2">
                 {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-2 w-8 bg-foreground/10" />)}
               </div>
            </CardContent>
          </GlassCard>

          <GlassCard>
             <CardHeader>
                <Skeleton className="h-6 w-32 mb-2 bg-foreground/10" />
                <Skeleton className="h-4 w-48 bg-foreground/5" />
             </CardHeader>
             <CardContent className="h-[350px] flex flex-col items-center justify-center relative">
                <div className="relative flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-[16px] border-primary/10 animate-pulse" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Skeleton className="h-2 w-10 bg-foreground/10" />
                    <Skeleton className="h-5 w-16 bg-foreground/20" />
                  </div>
                </div>
             </CardContent>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <GlassCard className="h-[380px]">
              <CardHeader>
                 <Skeleton className="h-6 w-36 mb-2 bg-foreground/10" />
                 <Skeleton className="h-4 w-52 bg-foreground/5" />
              </CardHeader>
              <CardContent className="flex items-end justify-between h-[220px] px-6">
                 {[60, 80, 40, 100, 70, 90, 50].map((h, i) => (
                   <div key={i} className="flex flex-col items-center gap-4">
                      <Skeleton className="w-8 rounded-t-lg bg-primary/30" style={{ height: `${h}px` }} />
                      <Skeleton className="h-3 w-8 bg-foreground/10" />
                   </div>
                 ))}
              </CardContent>
           </GlassCard>

           <div className="space-y-6">
              <Skeleton className="h-[140px] rounded-[32px] bg-foreground/5" />
              <div className="grid grid-cols-2 gap-4">
                 <Skeleton className="h-[120px] rounded-[32px] bg-foreground/5" />
                 <Skeleton className="h-[120px] rounded-[32px] bg-foreground/5" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  const avgMoodValue = Math.round(analyticsData.patterns.averageMood || 3);

  return (
    <div className="container mx-auto p-6 max-w-7xl text-foreground min-h-screen">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
              Emotional Intelligence
            </h1>
            <p className="text-foreground/60 font-medium italic mt-1">Your mental health analytics dashboard</p>
          </div>
          
          <div className="flex items-center gap-3 p-1.5 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/20">
            <Select value={timeRange} onValueChange={(v: 'week' | 'month' | 'year') => setTimeRange(v)}>
              <SelectTrigger className="w-32 bg-transparent border-none focus:ring-0 font-medium shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/20 backdrop-blur-3xl bg-white/90 dark:bg-zinc-900/90">
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/60 dark:hover:bg-white/20 transition-colors">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Average Mood", val: analyticsData.patterns.averageMood.toFixed(1), sub: MOOD_LABELS[avgMoodValue], icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", emoji: MOOD_EMOJIS[avgMoodValue] },
            { title: "Peak Condition", val: analyticsData.patterns.bestDay, sub: "Happiest trend", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            { title: "Period Growth", val: `+${analyticsData.patterns.improvement}%`, sub: "Progress made", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Total Logs", val: currentData.length.toString(), sub: "Entries recorded", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, i) => (
            <GlassCard key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/50 font-medium">{item.title}</span>
                  <div className={`p-2 ${item.bg} rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-medium flex items-baseline gap-2 text-foreground">
                  {item.val}
                  {item.emoji && <span className="text-xl opacity-90">{item.emoji}</span>}
                </div>
                <p className="text-xs font-medium text-foreground/40 mt-1">{item.sub}</p>
              </CardContent>
            </GlassCard>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/40 dark:bg-white/10 p-1 rounded-2xl border border-white/40 dark:border-white/20 h-12">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-medium data-[state=active]:bg-white/90 dark:data-[state=active]:bg-white/20 text-foreground/50 data-[state=active]:text-foreground shadow-none transition-all">Overview</TabsTrigger>
            <TabsTrigger value="dynamics" className="rounded-xl px-8 font-medium data-[state=active]:bg-white/90 dark:data-[state=active]:bg-white/20 text-foreground/50 data-[state=active]:text-foreground shadow-none transition-all">Dynamics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-foreground">Mood Trajectory</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Emotional variations per day</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] w-full pt-4">
                  <ResponsiveContainer width="99%" height="100%" minHeight={300}>
                    <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.5 }} dy={10} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.5 }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(20px)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }} />
                      <Area type="monotone" dataKey="mood" stroke="var(--color-primary, #6366f1)" strokeWidth={2.5} fill="url(#colorMood)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-foreground">Distribution</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Ratio of daily sentiments</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="99%" height="100%" minHeight={300}>
                    <PieChart>
                      <Pie data={moodDistribution} innerRadius={80} outerRadius={105} paddingAngle={8} cornerRadius={12} dataKey="value" stroke="none">
                        {moodDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)', borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-medium text-foreground/40 uppercase tracking-[0.2em]">Status</span>
                    <span className="text-xl font-medium text-primary tracking-tight">STABLE</span>
                  </div>
                </CardContent>
              </GlassCard>
            </div>
            
            {/* Weekly Pattern */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-foreground">Weekly Pattern</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Mean mood across the week</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                    <BarChart data={analyticsData.weekdayAvgs}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                      <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)', borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="mood" fill="var(--color-primary, #6366f1)" radius={[12, 12, 12, 12]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="bg-primary/5 dark:bg-primary/10 border-primary/20">
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                      <ChartLine className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="text-sm font-medium uppercase tracking-tight text-foreground">System Insight</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm font-medium leading-relaxed text-foreground/80">
                    High consistency detected on <span className="text-primary font-bold">Fridays</span>. Your average mood improves by 0.8 points when ‘Social Time’ is logged as a trigger.
                  </CardContent>
                </GlassCard>

                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-5 flex flex-col justify-center items-center">
                    <Smile className="h-5 w-5 text-primary/80 mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-medium text-foreground/40 uppercase tracking-[0.1em]">Top Catalyst</span>
                    <span className="text-sm font-medium text-foreground">Exercise</span>
                  </GlassCard>
                  <GlassCard className="p-5 flex flex-col justify-center items-center">
                    <Calendar className="h-5 w-5 text-amber-500/80 mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-medium text-foreground/40 uppercase tracking-[0.1em]">Accuracy</span>
                    <span className="text-sm font-medium text-foreground">94%</span>
                  </GlassCard>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dynamics" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-foreground">Positive Correlation</CardTitle>
                <CardDescription className="font-medium text-foreground/40 text-xs">Activities that enhance your well-being</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activitiesData.map((act, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-tighter opacity-80 text-foreground">
                      <span>{act.name}</span>
                      <span className="text-primary">{act.count} logs</span>
                    </div>
                    <Progress value={act.positiveImpact * 20} className="h-1.5 bg-foreground/10" />
                  </div>
                ))}
              </CardContent>
            </GlassCard>
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-foreground">Stress Factors</CardTitle>
                <CardDescription className="font-medium text-foreground/40 text-xs">Negative triggers to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(activitiesData.length > 2 ? activitiesData.slice(2) : activitiesData).map((trig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-tighter opacity-80 text-foreground">
                      <span>{trig.name}</span>
                      <span className="text-rose-500">Low severity</span>
                    </div>
                    <Progress value={20} className="h-1.5 bg-foreground/10" />
                  </div>
                ))}
              </CardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
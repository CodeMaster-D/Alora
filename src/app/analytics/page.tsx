"use client";

import React, { useState, useEffect } from "react";
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
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

// --- Types & Interfaces ---
interface MoodData {
  date: string;
  mood: number;
  emotion: string;
  triggers: string[];
  activities: string[];
}

interface AnalyticsData {
  weekly: MoodData[];
  monthly: MoodData[];
  yearly: MoodData[];
  patterns: {
    bestDay: string;
    worstDay: string;
    averageMood: number;
    improvement: number;
  };
  triggers: {
    name: string;
    count: number;
    impact: number;
  }[];
  activities: {
    name: string;
    count: number;
    positiveImpact: number;
  }[];
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
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={`bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </Card>
);

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const mockData: AnalyticsData = {
        weekly: generateMockData(7),
        monthly: generateMockData(30),
        yearly: generateMockData(365),
        patterns: {
          bestDay: "Friday",
          worstDay: "Monday",
          averageMood: 3.7,
          improvement: 12.5,
        },
        triggers: [
          { name: "Work Stress", count: 15, impact: -2.3 },
          { name: "Lack of Sleep", count: 12, impact: -1.8 },
          { name: "Exercise", count: 20, impact: 1.5 },
          { name: "Social Time", count: 18, impact: 2.1 },
        ],
        activities: [
          { name: "Meditation", count: 25, positiveImpact: 1.8 },
          { name: "Journaling", count: 30, positiveImpact: 1.2 },
          { name: "Walking", count: 35, positiveImpact: 1.6 },
          { name: "Reading", count: 20, positiveImpact: 1.4 },
        ],
      };
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function generateMockData(days: number): MoodData[] {
    const data: MoodData[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: Math.floor(Math.random() * 5) + 1,
        emotion: ['happy', 'sad', 'anxious', 'calm', 'excited'][Math.floor(Math.random() * 5)],
        triggers: ['work'],
        activities: ['exercise'],
      });
    }
    return data;
  }

  const getCurrentData = (): MoodData[] => {
    if (!analyticsData) return [];
    return analyticsData[timeRange === 'week' ? 'weekly' : timeRange === 'month' ? 'monthly' : 'yearly'];
  };

  const getMoodDistribution = () => {
    const data = getCurrentData();
    const distribution = [0, 0, 0, 0, 0];
    data.forEach(entry => distribution[entry.mood - 1]++);
    return [
      { name: 'Very Sad', value: distribution[0], color: MOOD_COLORS[1] },
      { name: 'Sad', value: distribution[1], color: MOOD_COLORS[2] },
      { name: 'Neutral', value: distribution[2], color: MOOD_COLORS[3] },
      { name: 'Happy', value: distribution[3], color: MOOD_COLORS[4] },
      { name: 'Very Happy', value: distribution[4], color: MOOD_COLORS[5] },
    ];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-7xl space-y-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl text-foreground min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-medium tracking-tight">
              Emotional Intelligence
            </h1>
            <p className="text-foreground/60 font-medium italic">Your mental health analytics dashboard</p>
          </div>
          
          <div className="flex items-center gap-3 p-1.5 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20">
            <Select value={timeRange} onValueChange={(v: 'week' | 'month' | 'year') => setTimeRange(v)}>
              <SelectTrigger className="w-32 bg-transparent border-none focus:ring-0 font-medium text-foreground shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/20 backdrop-blur-3xl bg-white/80 dark:bg-black/80">
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/40 text-foreground transition-colors">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Average Mood", val: analyticsData?.patterns.averageMood.toFixed(1), sub: MOOD_LABELS[Math.round(analyticsData?.patterns.averageMood || 3)], icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", emoji: MOOD_EMOJIS[Math.round(analyticsData?.patterns.averageMood || 3)] },
            { title: "Peak Condition", val: analyticsData?.patterns.bestDay, sub: "Happiest trend", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            { title: "Period Growth", val: `+${analyticsData?.patterns.improvement}%`, sub: "Progress made", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Total Logs", val: getCurrentData().length, sub: "Entries recorded", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, i) => (
            <GlassCard key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/50 font-medium">{item.title}</span>
                  <div className={`p-2 ${item.bg} rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-medium flex items-baseline gap-2">
                  {item.val}
                  {item.emoji && <span className="text-xl opacity-90">{item.emoji}</span>}
                </div>
                <p className="text-xs font-medium text-foreground/40 mt-1">{item.sub}</p>
              </CardContent>
            </GlassCard>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/20 dark:bg-white/5 p-1 rounded-2xl border border-white/20 h-12">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-medium data-[state=active]:bg-white/60 dark:data-[state=active]:bg-white/10 text-foreground/50 data-[state=active]:text-foreground shadow-none border-none transition-all">Overview</TabsTrigger>
            <TabsTrigger value="dynamics" className="rounded-xl px-8 font-medium data-[state=active]:bg-white/60 dark:data-[state=active]:bg-white/10 text-foreground/50 data-[state=active]:text-foreground shadow-none border-none transition-all">Dynamics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Mood Trajectory</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Emotional variations per day</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getCurrentData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.5 }} dy={10} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.5 }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
                      />
                      <Area type="monotone" dataKey="mood" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#colorMood)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Distribution</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Ratio of daily sentiments</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getMoodDistribution()}
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={8}
                        cornerRadius={12}
                        dataKey="value"
                        stroke="none"
                        activeShape={{ opacity: 0.8 }}
                      >
                        {getMoodDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip cursor={{ fill: 'transparent' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-medium text-foreground/30 uppercase tracking-[0.2em]">Status</span>
                    <span className="text-xl font-medium text-primary tracking-tight">STABLE</span>
                  </div>
                </CardContent>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Weekly Pattern</CardTitle>
                  <CardDescription className="font-medium text-foreground/40 text-xs tracking-tight">Mean mood across the week</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Mon', mood: 3.2 }, { day: 'Tue', mood: 3.5 }, { day: 'Wed', mood: 3.8 },
                      { day: 'Thu', mood: 3.6 }, { day: 'Fri', mood: 4.1 }, { day: 'Sat', mood: 3.9 }, { day: 'Sun', mood: 3.7 },
                    ]}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                      <Bar 
                        dataKey="mood" 
                        fill="var(--color-primary)" 
                        radius={[12, 12, 12, 12]} 
                        barSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                      <Target className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="text-sm font-medium uppercase tracking-tight">System Insight</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm font-medium leading-relaxed text-foreground/70">
                    High consistency detected on <span className="text-primary">Fridays</span>. Your average mood improves by 0.8 points when ‘Social Time’ is logged as a trigger.
                  </CardContent>
                </GlassCard>

                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-5 flex flex-col justify-center items-center">
                    <Smile className="h-5 w-5 text-primary/60 mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-medium text-foreground/30 uppercase tracking-[0.1em]">Top Catalyst</span>
                    <span className="text-sm font-medium">Exercise</span>
                  </GlassCard>
                  <GlassCard className="p-5 flex flex-col justify-center items-center">
                    <Calendar className="h-5 w-5 text-accent/60 mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-medium text-foreground/30 uppercase tracking-[0.1em]">Accuracy</span>
                    <span className="text-sm font-medium">94%</span>
                  </GlassCard>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dynamics" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Positive Correlation</CardTitle>
                <CardDescription className="font-medium text-foreground/40 text-xs">Activities that enhance your well-being</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsData?.activities.map((act, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-tighter opacity-80">
                      <span>{act.name}</span>
                      <span className="text-primary">{act.count} pts</span>
                    </div>
                    <Progress value={act.positiveImpact * 20} className="h-1.5 bg-white/10" />
                  </div>
                ))}
              </CardContent>
            </GlassCard>
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Stress Factors</CardTitle>
                <CardDescription className="font-medium text-foreground/40 text-xs">Negative triggers to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsData?.triggers.map((trig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-tighter opacity-80">
                      <span>{trig.name}</span>
                      <span className="text-rose-400">{Math.abs(trig.impact)} severity</span>
                    </div>
                    <Progress value={Math.abs(trig.impact) * 20} className="h-1.5 bg-white/10" />
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
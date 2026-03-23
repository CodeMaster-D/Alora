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
  Activity
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
// import { useAuthStore } from "@/store/authStore"; // Dicomment sementara untuk dummy
// import { useMoodStore } from "@/store/moodStore"; // Dicomment sementara untuk dummy
// import { firebaseService } from "@/services/firebase"; // Dicomment sementara untuk dummy
import { cn } from "@/lib/utils";

// --- KONFIGURASI MOOD UNTUK CHART & UI ---
const MOOD_EMOJIS: { [key: number]: string } = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "😄",
};

// --- HELPER: GENERATE DUMMY DATA ---
// Fungsi ini mensimulasikan data yang akan datang dari Firebase nanti
const generateDummyMoodEntries = (days: number): MoodEntry[] => {
  const data: MoodEntry[] = [];
  const today = new Date();
  const factorsList = [["Work"], ["Sleep"], ["Exercise"], ["Social"], ["Family"], ["Work", "Stress"]];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate mood acak antara 1-5
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
  
  // Urutkan dari terbaru (untuk Recent Moods)
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function DashboardPage() {
  // const { user } = useAuthStore(); // Siap untuk digunakan nanti
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<{ date: string; mood: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // --- LOGIKA DUMMY DATA ---
        // Nanti ganti blok ini dengan: const response = await firebaseService.mood.getMoodEntries(user.id);
        
        // Simulasi delay network
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dummyEntries = generateDummyMoodEntries(30); // Generate 30 hari terakhir
        
        // 1. Set Recent Moods (5 terakhir)
        setRecentMoods(dummyEntries.slice(0, 5));

        // 2. Set Chart Data (Perlu diurutkan Ascending berdasarkan tanggal untuk Line Chart)
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
  }, []); // Dependency user ditambahkan nanti saat pakai auth

  const getMoodIcon = (mood: number) => {
    switch (mood) {
      case 1:
      case 2:
        return <Frown className="h-5 w-5" />;
      case 3:
        return <Meh className="h-5 w-5" />;
      case 4:
      case 5:
        return <Smile className="h-5 w-5" />;
      default:
        return <Meh className="h-5 w-5" />;
    }
  };

  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 1: return "text-red-500";
      case 2: return "text-orange-500";
      case 3: return "text-yellow-500";
      case 4: return "text-green-500";
      case 5: return "text-emerald-500";
      default: return "text-gray-500";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s your mental health overview.
          </p>
        </div>
        <Button asChild>
          <a href="/journal/new">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mood Today</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {recentMoods.length > 0 ? (
                  <>
                    <div className={cn(getMoodColor(recentMoods[0].mood))}>
                      {getMoodIcon(recentMoods[0].mood)}
                    </div>
                    <div className="text-2xl font-bold">{recentMoods[0].mood}/5</div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No entry yet</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {recentMoods.length > 0 
                  ? `Logged at ${new Date(recentMoods[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : "Track your mood to see it here"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Journal, Breathing, Streak (Static UI) */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-2">+3 from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Breathing Sessions</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-2">+2 from last week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 days</div>
              <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content: Chart & Recent Moods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MOOD TREND CHART (Menggunakan Dummy Data) */}
        <motion.div className="lg:col-span-2" variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Mood Trend (Last 30 Days)
              </CardTitle>
              <CardDescription>Your mood over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload as { date: string; mood: number };
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.date}</p>
                                <p className="text-sm">
                                  Mood: {data.mood} {MOOD_EMOJIS[data.mood]}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No mood data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* RECENT MOODS (Menggunakan Dummy Data) */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Moods
              </CardTitle>
              <CardDescription>Your last 5 mood entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMoods.length > 0 ? (
                <div className="space-y-4">
                  {recentMoods.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn(getMoodColor(entry.mood))}>
                          {getMoodIcon(entry.mood)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{formatDate(entry.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.factors.join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{entry.mood}/5</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No mood entries yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you on your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                <a href="/mood/new">
                  <Heart className="h-8 w-8" />
                  <span>Log Mood</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                <a href="/journal/new">
                  <BookOpen className="h-8 w-8" />
                  <span>Write Journal</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                <a href="/breathe">
                  <Wind className="h-8 w-8" />
                  <span>Breathe</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
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
  BarChart3,
  Smile,
  Frown,
  Meh,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoodEntry } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useMoodStore } from "@/store/moodStore";
import { firebaseService } from "@/services/firebase";
import { cn } from "@/lib/utils";

// --- DEFINISIKAN INTERFACE UNTUK STATS AGAR TIDAK PAKE ANY ---
interface MoodStats {
  avgMood: number;
  moodCounts: {
    [key: number]: number; // key 1-5, value jumlah hari
  };
  totalEntries: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { setMoodEntries } = useMoodStore();
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  
  // FIX: Inisialisasi dengan tipe MoodStats | null
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch mood entries
        const moodResponse = await firebaseService.mood.getMoodEntries(user.id);
        if (moodResponse.success && moodResponse.data) {
          setMoodEntries(moodResponse.data);
          
          // Get the 5 most recent entries
          const sorted = [...moodResponse.data].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setRecentMoods(sorted.slice(0, 5));
        }
        
        // Fetch mood statistics
        const statsResponse = await firebaseService.mood.getMoodStats(user.id, 30);
        if (statsResponse.success && statsResponse.data) {
          // Type casting ke MoodStats
          setMoodStats(statsResponse.data as MoodStats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, setMoodEntries]);

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

  const formatDate = (date: Date) => {
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
            Welcome back, {user?.displayName}. Here&apos;s your mental health overview.
          </p>
        </div>
        <Button asChild>
          <a href="/journal/new">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </a>
        </Button>
      </div>

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

        {/* Card Journal, Breathing, Streak (Tetap sama) */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Mood Trend (Last 30 Days)
              </CardTitle>
              <CardDescription>Your average mood over the past month</CardDescription>
            </CardHeader>
            <CardContent>
              {moodStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Mood</span>
                    <span className="text-2xl font-bold">{moodStats.avgMood}/5</span>
                  </div>
                  <Progress value={moodStats.avgMood * 20} className="h-2" />
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {[1, 2, 3, 4, 5].map((mood) => (
                      <div key={mood} className="text-center">
                        <div className={cn("text-lg", getMoodColor(mood))}>
                          {getMoodIcon(mood)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {/* FIX: Sekarang TypeScript tahu moodCounts ada isinya */}
                          {moodStats.moodCounts[mood] || 0} days
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No mood data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

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

      {/* Quick Actions (Tetap sama) */}
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
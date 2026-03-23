"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

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

const MOOD_COLORS = {
  1: "#ef4444", // red
  2: "#f97316", // orange
  3: "#eab308", // yellow
  4: "#22c55e", // green
  5: "#10b981", // emerald
};

const MOOD_EMOJIS = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "😄",
};

const MOOD_LABELS = {
  1: "Very Sad",
  2: "Sad",
  3: "Neutral",
  4: "Happy",
  5: "Very Happy",
};

// --- FIX: Export default harus didefinisikan dengan jelas ---
const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (days: number): MoodData[] => {
    const data: MoodData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: Math.floor(Math.random() * 5) + 1,
        emotion: ['happy', 'sad', 'anxious', 'calm', 'excited'][Math.floor(Math.random() * 5)],
        triggers: ['work', 'sleep', 'exercise', 'social'].slice(0, Math.floor(Math.random() * 3) + 1),
        activities: ['meditation', 'journaling', 'walking', 'reading'].slice(0, Math.floor(Math.random() * 2) + 1),
      });
    }
    
    return data;
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `mood-analytics-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getCurrentData = () => {
    if (!analyticsData) return [];
    switch (timeRange) {
      case 'week': return analyticsData.weekly;
      case 'month': return analyticsData.monthly;
      case 'year': return analyticsData.yearly;
      default: return analyticsData.monthly;
    }
  };

  const getMoodDistribution = () => {
    const data = getCurrentData();
    const distribution = [0, 0, 0, 0, 0];
    
    data.forEach(entry => {
      distribution[entry.mood - 1]++;
    });
    
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mood Analytics</h1>
            <p className="text-muted-foreground">Track your emotional patterns and insights</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {analyticsData?.patterns.averageMood.toFixed(1)}
                <span className="text-lg">
                  {MOOD_EMOJIS[Math.round(analyticsData?.patterns.averageMood || 3) as keyof typeof MOOD_EMOJIS]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {MOOD_LABELS[Math.round(analyticsData?.patterns.averageMood || 3) as keyof typeof MOOD_LABELS]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Day</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.patterns.bestDay}</div>
              <p className="text-xs text-muted-foreground">Your happiest day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{analyticsData?.patterns.improvement}%
              </div>
              <p className="text-xs text-muted-foreground">From last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCurrentData().length}</div>
              <p className="text-xs text-muted-foreground">Mood entries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Trend</CardTitle>
                  <CardDescription>Your mood over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getCurrentData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              const data = payload[0].payload as MoodData;
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium">{data.date}</p>
                                  <p className="text-sm">
                                    Mood: {data.mood} {MOOD_EMOJIS[data.mood as keyof typeof MOOD_EMOJIS]}
                                  </p>
                                  <p className="text-sm">Emotion: {data.emotion}</p>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>How often you feel each mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getMoodDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          // --- FIX: Safe check untuk percent ---
                          label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getMoodDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Positive Activities</CardTitle>
                  <CardDescription>Activities that boost your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.activities.map((activity, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{activity.name}</span>
                          <span className="text-muted-foreground">
                            {activity.count} times
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={activity.positiveImpact * 20} className="flex-1" />
                          <span className="text-sm text-green-600">
                            +{activity.positiveImpact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Pattern</CardTitle>
                  <CardDescription>Your mood by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { day: 'Mon', mood: 3.2 },
                        { day: 'Tue', mood: 3.5 },
                        { day: 'Wed', mood: 3.8 },
                        { day: 'Thu', mood: 3.6 },
                        { day: 'Fri', mood: 4.1 },
                        { day: 'Sat', mood: 3.9 },
                        { day: 'Sun', mood: 3.7 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip />
                        <Bar dataKey="mood" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Negative Triggers</CardTitle>
                  <CardDescription>What affects your mood negatively</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.triggers.map((trigger, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{trigger.name}</span>
                          <span className="text-muted-foreground">
                            {trigger.count} times
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.abs(trigger.impact) * 20} className="flex-1" />
                          <span className="text-sm text-red-600">
                            {trigger.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trigger Analysis</CardTitle>
                  <CardDescription>Insights about your triggers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Key Insight</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Work stress is your most frequent negative trigger. Consider stress management techniques.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🌱 Recommendation</h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Exercise and social time have the most positive impact on your mood.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Calendar</CardTitle>
                <CardDescription>Visual overview of your moods this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium p-2">{day}</div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2; 
                    const isCurrentMonth = day >= 1 && day <= 30;
                    const moodEntry = isCurrentMonth ? getCurrentData()[day - 1] : null;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg border flex flex-col items-center justify-center ${isCurrentMonth ? 'hover:bg-muted cursor-pointer' : 'opacity-30'} ${moodEntry ? 'border-2' : 'border-dashed'}`}
                        style={{ borderColor: moodEntry ? MOOD_COLORS[moodEntry.mood as keyof typeof MOOD_COLORS] : undefined }}
                      >
                        {isCurrentMonth && (
                          <>
                            <span className="text-xs">{day}</span>
                            {moodEntry && <span className="text-lg">{MOOD_EMOJIS[moodEntry.mood as keyof typeof MOOD_EMOJIS]}</span>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

// --- FIX: Export default harus di paling bawah dan jelas ---
export default AnalyticsPage;
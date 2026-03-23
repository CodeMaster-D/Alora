"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Plus, 
  X, 
  Calendar, 
  Zap,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// --- IMPORT SONNER DISINI ---
import { toast } from "sonner";

interface MoodEntry {
  id: string;
  mood: number;
  emotion: string;
  color: string;
  emoji: string;
  triggers: string[];
  activities: string[];
  notes: string;
  timestamp: Date;
}

interface MoodOption {
  value: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

const moodOptions: MoodOption[] = [
  { value: 1, label: "Very Sad", emoji: "😢", color: "#ef4444", description: "Feeling extremely down" },
  { value: 2, label: "Sad", emoji: "😔", color: "#f97316", description: "Feeling down or blue" },
  { value: 3, label: "Neutral", emoji: "😐", color: "#eab308", description: "Feeling neither good nor bad" },
  { value: 4, label: "Happy", emoji: "😊", color: "#22c55e", description: "Feeling good and positive" },
  { value: 5, label: "Very Happy", emoji: "😄", color: "#10b981", description: "Feeling extremely happy" },
];

const commonTriggers = ["Work Stress", "Lack of Sleep", "Exercise", "Social Time", "Weather", "Relationships", "Health", "Finances"];
const commonActivities = ["Meditation", "Exercise", "Reading", "Music", "Walking", "Journaling", "Gaming", "Nap"];

const emotionOptions = [
  { value: "happy", label: "Happy", emoji: "😊", color: "#fbbf24" },
  { value: "sad", label: "Sad", emoji: "😢", color: "#60a5fa" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "#a78bfa" },
  { value: "calm", label: "Calm", emoji: "😌", color: "#34d399" },
  { value: "excited", label: "Excited", emoji: "🤗", color: "#f87171" },
  { value: "angry", label: "Angry", emoji: "😠", color: "#ef4444" },
  { value: "grateful", label: "Grateful", emoji: "🙏", color: "#fbbf24" },
  { value: "tired", label: "Tired", emoji: "😴", color: "#94a3b8" },
  { value: "motivated", label: "Motivated", emoji: "💪", color: "#10b981" },
  { value: "stressed", label: "Stressed", emoji: "😣", color: "#f97316" },
];

export default function MoodPage() {
  const { user } = useAuthStore();
  
  // --- useToast DIHAPUS, KITA PAKE DIRECT IMPORT toast DARI sonner ---
  
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<typeof emotionOptions[0] | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");

  const colorPalette = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    fetchRecentMoods();
  }, []);

  const fetchRecentMoods = async () => {
    const mockMoods: MoodEntry[] = [
      {
        id: "1",
        mood: 4,
        emotion: "happy",
        color: "#22c55e",
        emoji: "😊",
        triggers: ["Exercise"],
        activities: ["Music"],
        notes: "Had a great day",
        timestamp: new Date(),
      },
    ];
    setRecentMoods(mockMoods);
  };

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    const emotionMap: { [key: number]: string } = { 1: "sad", 2: "sad", 3: "calm", 4: "happy", 5: "excited" };
    const emotion = emotionOptions.find(e => e.value === emotionMap[mood.value]);
    if (emotion) setSelectedEmotion(emotion);
  };

  const handleSubmitMood = async () => {
    if (!selectedMood || !selectedEmotion) {
      toast.error("Please select your mood and emotion"); // --- PAKE toast.error ---
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        mood: selectedMood.value,
        emotion: selectedEmotion.value,
        color: selectedMood.color,
        emoji: selectedMood.emoji,
        triggers,
        activities,
        notes,
        timestamp: new Date(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecentMoods([newEntry, ...recentMoods]);
      
      // Reset
      setSelectedMood(null);
      setSelectedEmotion(null);
      setTriggers([]);
      setActivities([]);
      setNotes("");

      toast.success("Mood Recorded!"); // --- PAKE toast.success ---
    } catch (error) {
      toast.error("Failed to save mood entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickMood = async (moodValue: number) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    if (mood) {
      setIsSubmitting(true);
      try {
        const newEntry: MoodEntry = {
          id: Date.now().toString(),
          mood: mood.value,
          emotion: "neutral",
          color: mood.color,
          emoji: mood.emoji,
          triggers: [],
          activities: [],
          notes: "",
          timestamp: new Date(),
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        setRecentMoods([newEntry, ...recentMoods]);
        toast.success(`Feeling ${mood.label} recorded!`);
      } catch (error) {
        toast.error("Failed to save quick mood");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Mood Tracking
          </h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Quick Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleQuickMood(mood.value)}
                  disabled={isSubmitting}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-3xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="detailed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="detailed">Detailed Entry</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label>Mood</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedMood?.value === mood.value ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                      >
                        <div className="text-3xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Emotion</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion.value}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`p-2 rounded-lg border text-xs ${selectedEmotion?.value === emotion.value ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                      >
                        {emotion.emoji} {emotion.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                    <Label>Triggers</Label>
                    <Select onValueChange={(val) => setTriggers([...triggers, val])}>
                        <SelectTrigger><SelectValue placeholder="Add trigger" /></SelectTrigger>
                        <SelectContent>{commonTriggers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2">{triggers.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                </div>

                <div className="space-y-3">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What's on your mind?" />
                </div>

                <Button onClick={handleSubmitMood} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <LoadingSpinner size="sm" /> : "Save Mood"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {recentMoods.map(entry => (
                  <div key={entry.id} className="p-4 border rounded-lg flex items-center gap-4">
                    <div className="text-3xl">{entry.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold">{entry.notes || "No notes"}</div>
                      <div className="text-xs text-gray-500">{entry.timestamp.toLocaleString()}</div>
                    </div>
                    <Badge>{entry.emotion}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
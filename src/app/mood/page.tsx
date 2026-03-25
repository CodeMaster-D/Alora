"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  History,
  LayoutGrid,
  ChevronRight,
  Clock,
  Plus,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/authStore";
import { firebaseService } from "@/services/firebase";
import { MoodEntry } from "@/types";

// --- INTERFACES ---
// Gunakan MoodEntry dari @/types

const moodOptions = [
  { value: 1, label: "Sad", emoji: "😢" },
  { value: 2, label: "Down", emoji: "😔" },
  { value: 3, label: "Neutral", emoji: "😐" },
  { value: 4, label: "Good", emoji: "😊" },
  { value: 5, label: "Great", emoji: "😄" },
];

const emotionOptions = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "anxious", label: "Anxious", emoji: "😰" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "stressed", label: "Stressed", emoji: "😣" },
  { value: "motivated", label: "Motivated", emoji: "💪" },
];

const commonTriggers = ["Work", "Social", "Sleep", "Health", "Food", "Weather", "Family", "Hobbies"];

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-md rounded-[28px] overflow-hidden transition-all duration-300",
    className
  )}>
    {children}
  </Card>
);

export default function MoodPage() {
  const { user } = useAuthStore();
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);

  const fetchMoods = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await firebaseService.mood.getMoodEntries(user.id);
      if (response.success && response.data) {
        setRecentMoods(response.data);
      }
    } catch (error) {
      console.error("Fetch moods error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoods();
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedMood) return toast.error("Please select your mood first");
    if (!user) return toast.error("You must be logged in");
    
    setIsSubmitting(true);
    try {
      const result = await firebaseService.mood.addMoodEntry(user.id, {
        mood: selectedMood.value,
        factors: triggers,
        note: notes,
      });

      if (result.success) {
        toast.success("Daily entry saved");
        setSelectedMood(null);
        setSelectedEmotion(null);
        setTriggers([]);
        setNotes("");
        fetchMoods(); // Refresh history
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl space-y-10 text-left">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
          Mood Journal
        </h1>
        <p className="text-foreground/60 font-medium italic mt-1">Check-in with yourself today.</p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="flex justify-start bg-transparent h-auto p-0 mb-10 gap-8 border-none">
          <TabsTrigger 
            value="add" 
            className="p-0 text-base font-semibold bg-transparent border-none shadow-none data-[state=active]:text-[#D48C70] data-[state=active]:shadow-none relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-[#D48C70] after:transition-all after:rounded-full"
          >
            New Journal
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="p-0 text-base font-semibold bg-transparent border-none shadow-none data-[state=active]:text-[#D48C70] data-[state=active]:shadow-none relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-[#D48C70] after:transition-all after:rounded-full"
          >
            History Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-0 space-y-10 focus-visible:ring-0">
          {/* Mood Selection */}
          <div className="space-y-5">
            <Label className="text-xs uppercase tracking-[0.2em] font-bold text-[#D48C70]">Current Vibe</Label>
            <div className="flex flex-wrap gap-4">
              {moodOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m)}
                  className={cn(
                    "px-6 py-5 rounded-3xl border-2 transition-all flex items-center gap-4 min-w-[140px]",
                    selectedMood?.value === m.value 
                      ? "bg-[#D48C70]/10 border-[#D48C70] shadow-md" 
                      : "bg-white/50 border-white/20 hover:border-[#D48C70]/30"
                  )}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={cn("text-sm font-bold", selectedMood?.value === m.value ? "text-[#D48C70]" : "text-foreground/60")}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-8">
              {/* Emotion Selector */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-[0.2em] font-bold text-[#D48C70]">Specific Emotion</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {emotionOptions.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => setSelectedEmotion(e.value)}
                      className={cn(
                        "py-3 px-4 rounded-xl border text-xs font-semibold transition-all",
                        selectedEmotion === e.value 
                          ? "bg-[#D48C70] text-white border-[#D48C70] shadow-sm" 
                          : "bg-white/20 border-white/10 hover:border-[#D48C70]/30"
                      )}
                    >
                      {e.emoji} {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-[0.2em] font-bold text-[#D48C70]">What&apos;s the trigger?</Label>
                <Select onValueChange={(val) => !triggers.includes(val) && setTriggers([...triggers, val])}>
                  <SelectTrigger className="rounded-xl bg-white/30 border-white/20 text-sm h-12 focus:ring-[#D48C70]/20">
                    <SelectValue placeholder="Select factors..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 backdrop-blur-3xl shadow-2xl">
                    {commonTriggers.map(t => (
                      <SelectItem key={t} value={t} className="text-sm py-3 focus:bg-[#D48C70] focus:text-white cursor-pointer">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 pt-1">
                  {triggers.map(t => (
                    <Badge key={t} className="bg-[#D48C70]/10 text-[#D48C70] border-none text-xs rounded-full py-1.5 px-4 font-semibold">
                      {t} <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-rose-500" onClick={() => setTriggers(triggers.filter(x => x !== t))} />
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>

            <div className="flex flex-col gap-8">
              <div className="space-y-4 flex-1">
                <Label className="text-xs uppercase tracking-[0.2em] font-bold text-[#D48C70]">Personal Notes</Label>
                <div className="relative group">
                  <Textarea 
                    placeholder="What's on your mind today?" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/40 border-white/20 rounded-[24px] text-base p-6 min-h-[220px] focus:ring-[#D48C70]/20 focus:border-[#D48C70]/40 transition-all resize-none shadow-inner"
                  />
                  <MessageSquare className="absolute bottom-6 right-6 w-5 h-5 opacity-10 group-focus-within:opacity-30 transition-opacity" />
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedMood} 
                className="w-full h-16 rounded-[24px] bg-[#D48C70] hover:bg-[#D48C70]/90 text-white text-lg font-bold shadow-xl shadow-[#D48C70]/20 transition-all active:scale-[0.97]"
              >
                {isSubmitting ? <LoadingSpinner size="md" /> : "Save Daily Log"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl bg-white/20" />
            ))
          ) : (
            <div className="grid gap-4">
              {recentMoods.length === 0 ? (
                <div className="text-center py-20 opacity-30 italic font-medium">No history found for today.</div>
              ) : (
                recentMoods.map(entry => (
                  <div key={entry.id} className="flex items-center gap-6 p-6 bg-white/40 border border-white/10 rounded-[28px] group hover:border-[#D48C70]/40 transition-all shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-[20px] text-4xl shadow-sm group-hover:scale-105 transition-transform">
                      {moodOptions.find(m => m.value === entry.mood)?.emoji || "😐"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-[#D48C70] text-white hover:bg-[#D48C70] border-none px-3 py-0.5 text-[10px] uppercase font-bold">
                          {moodOptions.find(m => m.value === entry.mood)?.label || "Neutral"}
                        </Badge>
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-foreground/80 leading-snug">{entry.note || "Quiet reflection logged."}</p>
                      <div className="flex gap-2 mt-2">
                         {entry.factors?.map(t => <span key={t} className="text-[11px] font-bold text-[#D48C70]/60 uppercase tracking-tighter">#{t}</span>)}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full opacity-20 group-hover:opacity-100 group-hover:bg-[#D48C70]/10 group-hover:text-[#D48C70] transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
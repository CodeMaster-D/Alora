"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Clock,
  MessageSquare,
  CalendarDays,
  Trash2,
  SmilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const moodOptions = [
  { value: 1, label: "Sad",     emoji: "😢", color: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    glow: "shadow-blue-500/20" },
  { value: 2, label: "Down",    emoji: "😔", color: "text-indigo-500",  bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  glow: "shadow-indigo-500/20" },
  { value: 3, label: "Neutral", emoji: "😐", color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   glow: "shadow-amber-500/20" },
  { value: 4, label: "Good",    emoji: "😊", color: "text-green-500",   bg: "bg-green-500/10",   border: "border-green-500/30",   glow: "shadow-green-500/20" },
  { value: 5, label: "Great",   emoji: "😄", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
];

const emotionOptions = [
  { value: "happy",     label: "Happy",      emoji: "😊" },
  { value: "calm",      label: "Calm",       emoji: "😌" },
  { value: "anxious",   label: "Anxious",    emoji: "😰" },
  { value: "tired",     label: "Tired",      emoji: "😴" },
  { value: "stressed",  label: "Stressed",   emoji: "😣" },
  { value: "motivated", label: "Motivated",  emoji: "💪" },
];

const commonTriggers = ["Work", "Social", "Sleep", "Health", "Food", "Weather", "Family", "Hobbies"];

// --- UPDATED GLASS CARD (Cerah & Liquid) ---
const GlassCard = ({ children, className = "", moodColor = "" }: { children: React.ReactNode, className?: string, moodColor?: string }) => (
  <Card className={cn(
    "relative bg-white/80 dark:bg-white/10 backdrop-blur-3xl border border-white/60 dark:border-white/20 shadow-xl rounded-[32px] overflow-hidden transition-all duration-500",
    moodColor ? `shadow-2xl ${moodColor}` : "",
    className
  )}>
    {moodColor && (
      <div className={cn("absolute -top-10 -right-10 w-40 h-40 blur-[80px] opacity-30 pointer-events-none rounded-full transition-all duration-700", moodColor.replace('shadow-', 'bg-'))} />
    )}
    {children}
  </Card>
);

function safeDate(value: Date | { toDate?: () => Date } | string | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  if (typeof maybe.toDate === "function") return maybe.toDate();
  return new Date(value as string);
}

function groupByDate(entries: MoodEntry[]): Record<string, MoodEntry[]> {
  return entries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
    const dateKey = safeDate(entry.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});
}

export default function MoodPage() {
  const { user } = useAuthStore();
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
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
    if (user) fetchMoods();
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
        toast.success("Daily entry saved ✓");
        setSelectedMood(null);
        setSelectedEmotion(null);
        setTriggers([]);
        setNotes("");
        fetchMoods();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    setIsDeletingId(entryId);
    try {
      const result = await firebaseService.mood.deleteMoodEntry(entryId);
      if (result.success) {
        setRecentMoods(prev => prev.filter(e => e.id !== entryId));
        toast.success("Entry removed");
      }
    } finally {
      setIsDeletingId(null);
    }
  };

  const grouped = groupByDate(recentMoods);
  const dateGroups = Object.entries(grouped);

  return (
    <div className="p-6 md:p-12 max-w-5xl space-y-10 text-left min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Mood Journal
        </h1>
        <p className="text-foreground/50 font-medium italic">Check-in with yourself today.</p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="flex justify-start bg-transparent h-auto p-0 mb-10 gap-8 border-none">
          <TabsTrigger 
            value="add" 
            className="p-0 text-base font-bold bg-transparent border-none shadow-none data-[state=active]:text-primary data-[state=active]:shadow-none relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary after:transition-all after:rounded-full opacity-50 data-[state=active]:opacity-100 transition-all"
          >
            New Journal
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="p-0 text-base font-bold bg-transparent border-none shadow-none data-[state=active]:text-primary data-[state=active]:shadow-none relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary after:transition-all after:rounded-full opacity-50 data-[state=active]:opacity-100 transition-all"
          >
            History Log {recentMoods.length > 0 && <span className="ml-1.5 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{recentMoods.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-0 space-y-10 focus-visible:ring-0 outline-none">
          {/* Mood Selection */}
          <div className="space-y-6">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Current Vibe</Label>
            <div className="flex flex-wrap gap-4">
              {moodOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m)}
                  className={cn(
                    "px-6 py-5 rounded-[32px] border-2 transition-all duration-500 flex items-center gap-4 min-w-[150px] shadow-sm",
                    selectedMood?.value === m.value 
                      ? `${m.bg} ${m.border} ${m.glow} scale-[1.05]` 
                      : "bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/5 hover:border-primary/30"
                  )}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={cn("text-sm font-bold tracking-tight", selectedMood?.value === m.value ? m.color : "text-foreground/40")}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-8" moodColor={selectedMood?.glow}>
              <div className="space-y-5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Specific Emotion</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {emotionOptions.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => setSelectedEmotion(e.value)}
                      className={cn(
                        "py-3 px-4 rounded-2xl border text-xs font-bold transition-all duration-300",
                        selectedEmotion === e.value 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/10 hover:border-primary/30"
                      )}
                    >
                      {e.emoji} {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">What&apos;s the trigger?</Label>
                <Select onValueChange={(val) => !triggers.includes(val) && setTriggers([...triggers, val])}>
                  <SelectTrigger className="rounded-2xl bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 text-sm h-14 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select factors..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/20 backdrop-blur-3xl shadow-2xl overflow-hidden">
                    {commonTriggers.map(t => (
                      <SelectItem key={t} value={t} className="text-sm py-3 focus:bg-primary focus:text-white cursor-pointer font-medium transition-colors">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 pt-1">
                  {triggers.map(t => (
                    <Badge key={t} className="bg-primary/10 text-primary border-none text-[10px] rounded-full py-2 px-4 font-bold tracking-wide">
                      {t} <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setTriggers(triggers.filter(x => x !== t))} />
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>

            <div className="flex flex-col gap-8">
              <div className="space-y-4 flex-1">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Personal Notes</Label>
                <div className="relative group h-full">
                  <Textarea 
                    placeholder="What's on your mind today?" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/80 dark:bg-white/5 border-white/40 dark:border-white/10 rounded-[32px] text-base p-8 h-full min-h-[250px] focus:ring-primary/20 focus:border-primary/40 transition-all resize-none shadow-inner leading-relaxed"
                  />
                  <MessageSquare className="absolute bottom-8 right-8 w-6 h-6 opacity-5 group-focus-within:opacity-20 transition-opacity" />
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedMood} 
                className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-2xl shadow-primary/10 transition-all active:scale-[0.98] border-none"
              >
                {isSubmitting ? <LoadingSpinner size="md" /> : "Save Daily Log"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-8 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-4 w-40 bg-foreground/10 rounded-full" />
                  <Skeleton className="h-32 w-full rounded-[32px] bg-foreground/5" />
                </div>
              ))}
            </div>
          ) : recentMoods.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center mb-8 shadow-inner">
                <SmilePlus className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold mb-2 opacity-60">No entries yet</h3>
              <p className="text-sm text-foreground/40 max-w-xs leading-relaxed font-medium">
                Your mood journal is empty. Switch to <span className="text-primary font-bold underline decoration-2 underline-offset-4">New Journal</span> to log your first check-in.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {dateGroups.map(([dateLabel, entries]) => (
                <div key={dateLabel} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <CalendarDays className="w-4 h-4 text-primary/50" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60">{dateLabel}</span>
                    <div className="flex-1 h-px bg-foreground/5" />
                  </div>

                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {entries.map((entry) => {
                        const mood = moodOptions.find(m => m.value === entry.mood) ?? moodOptions[2];
                        const entryDate = safeDate(entry.timestamp);

                        return (
                          <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={cn(
                              "group flex items-center gap-6 p-6 bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-[32px] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5",
                              mood.glow
                            )}
                          >
                            <div className={cn(
                              "w-16 h-16 shrink-0 flex items-center justify-center rounded-[24px] text-4xl shadow-inner transition-transform duration-500 group-hover:scale-110",
                              mood.bg,
                              mood.border
                            )}>
                              {mood.emoji}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-3">
                                <Badge className={cn("border text-[9px] font-bold uppercase px-3 py-1 rounded-full", mood.bg, mood.color, mood.border)}>
                                  {mood.label}
                                </Badge>
                                <div className="flex items-center gap-1.5 opacity-30">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[11px] font-bold">
                                    {entryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                              {entry.note && (
                                <p className="text-sm font-medium text-foreground/70 italic line-clamp-2 leading-relaxed">
                                  &ldquo;{entry.note}&rdquo;
                                </p>
                              )}
                              {entry.factors && entry.factors.length > 0 && (
                                <div className="flex gap-2 pt-1">
                                  {entry.factors.map(t => (
                                    <span key={t} className="text-[9px] font-bold text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">#{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeletingId === entry.id}
                              onClick={() => handleDelete(entry.id)}
                              className="rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0 h-12 w-12"
                            >
                              {isDeletingId === entry.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-5 h-5" />}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
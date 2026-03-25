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
  { value: "happy",     label: "Happy",     emoji: "😊" },
  { value: "calm",      label: "Calm",      emoji: "😌" },
  { value: "anxious",   label: "Anxious",   emoji: "😰" },
  { value: "tired",     label: "Tired",     emoji: "😴" },
  { value: "stressed",  label: "Stressed",  emoji: "😣" },
  { value: "motivated", label: "Motivated", emoji: "💪" },
];

const commonTriggers = ["Work", "Social", "Sleep", "Health", "Food", "Weather", "Family", "Hobbies"];


const GlassCard = ({ children, className = "", moodColor = "" }: { children: React.ReactNode, className?: string, moodColor?: string }) => (
  <Card className={cn(
    "relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-md rounded-[28px] overflow-hidden transition-all duration-300",
    moodColor ? `shadow-lg ${moodColor}` : "",
    className
  )}>
    {moodColor && (
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 pointer-events-none rounded-full", moodColor.replace('shadow-', 'bg-'))} />
    )}
    {children}
  </Card>
);

/** Safely converts any Firestore date value to a JS Date */
function safeDate(value: Date | { toDate?: () => Date } | string | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  if (typeof maybe.toDate === "function") return maybe.toDate();
  return new Date(value as string);
}

/** Groups mood entries by their local date string */
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
      } else if (response.error) {
        console.error("getMoodEntries error:", response.error);
        toast.error("Could not load mood history.", { description: response.error });
      }
    } catch (error) {
      console.error("Fetch moods error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save entry");
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
      } else {
        toast.error("Failed to delete entry");
      }
    } finally {
      setIsDeletingId(null);
    }
  };

  const grouped = groupByDate(recentMoods);
  const dateGroups = Object.entries(grouped); // already sorted newest-first from service

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
            History Log {recentMoods.length > 0 && <span className="ml-1.5 text-xs bg-[#D48C70]/20 text-[#D48C70] rounded-full px-2 py-0.5">{recentMoods.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── NEW ENTRY ── */}
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
                      ? `${m.bg} ${m.border} ${m.glow} shadow-lg scale-[1.02]` 
                      : "bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/5 hover:border-foreground/30"
                  )}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={cn("text-sm font-bold", selectedMood?.value === m.value ? m.color : "text-foreground/60")}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-8" moodColor={selectedMood?.glow}>
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

        {/* ── HISTORY ── */}
        <TabsContent value="history" className="mt-0 space-y-8 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-3xl bg-white/20" />
              ))}
            </div>
          ) : recentMoods.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[#D48C70]/10 flex items-center justify-center mb-6">
                <SmilePlus className="w-10 h-10 text-[#D48C70]/60" />
              </div>
              <h3 className="text-xl font-semibold mb-2 opacity-60">No entries yet</h3>
              <p className="text-sm text-foreground/40 max-w-xs leading-relaxed">
                Your mood journal is empty. Switch to <span className="font-bold text-[#D48C70]">New Journal</span> to log your first check-in.
              </p>
            </motion.div>
          ) : (
            /* Grouped by date */
            <div className="space-y-10">
              {dateGroups.map(([dateLabel, entries]) => (
                <div key={dateLabel}>
                  {/* Date Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarDays className="w-4 h-4 text-[#D48C70]/70" />
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#D48C70]/70">{dateLabel}</span>
                    <div className="flex-1 h-px bg-[#D48C70]/10" />
                  </div>

                  <div className="grid gap-3">
                    <AnimatePresence>
                      {entries.map((entry) => {
                        const mood = moodOptions.find(m => m.value === entry.mood) ?? moodOptions[2];
                        const entryDate = safeDate(entry.timestamp);

                        return (
                          <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className={cn(
                              "flex items-center gap-5 p-5 bg-white/40 dark:bg-zinc-900/40 border rounded-[24px] group transition-all",
                              mood.border,
                              "hover:shadow-lg hover:scale-[1.01]",
                              mood.glow
                            )}
                          >
                            {/* Mood Emoji */}
                            <div className={cn(
                              "w-14 h-14 shrink-0 flex items-center justify-center rounded-[18px] text-3xl shadow-sm group-hover:scale-110 transition-transform",
                              mood.bg,
                              mood.border
                            )}>
                              {mood.emoji}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <Badge className={cn("border text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full", mood.bg, mood.color, mood.border)}>
                                  {mood.label}
                                </Badge>
                                <div className="flex items-center gap-1 opacity-40">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs font-semibold">
                                    {entryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                              {entry.note && (
                                <p className="text-sm font-medium text-foreground/70 leading-snug line-clamp-2 italic">
                                  &ldquo;{entry.note}&rdquo;
                                </p>
                              )}
                              {entry.factors && entry.factors.length > 0 && (
                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                  {entry.factors.map(t => (
                                    <span key={t} className="text-[10px] font-bold text-[#D48C70]/60 uppercase tracking-tighter">#{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Delete btn */}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete entry"
                              disabled={isDeletingId === entry.id}
                              onClick={() => handleDelete(entry.id)}
                              className="rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0"
                            >
                              {isDeletingId === entry.id
                                ? <LoadingSpinner size="sm" />
                                : <Trash2 className="w-4 h-4" />
                              }
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
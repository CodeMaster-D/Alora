"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Play, Pause, RotateCcw, Wind, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BreathingExercise } from "@/types";
import { firebaseService } from "@/services/firebase";
import { useAuthStore } from "@/store/authStore";
import { useAccessibilityStore } from "@/store/useAccessbilityStore";
import { cn } from "@/lib/utils";

// Extend global window for older Safari support without 'any'
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const GlassPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm rounded-[32px] overflow-hidden",
    className
  )}>
    {children}
  </div>
);

interface BreatheProps {
  isDemo?: boolean;
}

export default function BreathePage({ isDemo = false }: BreatheProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { reducedMotion } = useAccessibilityStore();
  const [exercises, setExercises] = useState<BreathingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- 1. Helper Functions (Dideklarasikan di awal agar tidak ada error akses) ---
  
  const playSound = useCallback((frequency: number) => {
    const ctx = audioContextRef.current;
    if (!isSoundEnabled || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [isSoundEnabled]);

  const handleFinishSession = useCallback(async () => {
    setIsRunning(false);
    setIsCompleted(true);
    playSound(659);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isDemo && user && selectedExercise) {
      await firebaseService.breathing.saveBreathingSession(user.id, selectedExercise.id);
    }
  }, [isDemo, user, selectedExercise, playSound]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentPhase("inhale");
    setCurrentCycle(0);
    if (selectedExercise) setPhaseTimeLeft(selectedExercise.inhaleTime);
  }, [selectedExercise]);

  const handleStart = () => {
    if (!selectedExercise) return;
    setIsRunning(true);
    setIsCompleted(false);
  };

  // --- 2. Effects ---


  // Fetch Data
  useEffect(() => {
    const fetchExercises = async () => {
      // Tunggu sampai auth ready agar tidak terblokir rules Firestore
      if (!isAuthenticated && !isDemo) return;
      
      try {
        const response = await firebaseService.breathing.getBreathingExercises();
        
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data;
          setExercises(data);
          setSelectedExercise(data[0]);
          setPhaseTimeLeft(data[0].inhaleTime);
        } else {
          // Fallback static data if firestore is empty
          const fallback: BreathingExercise[] = [
            { id: 'box', name: 'Box Breathing', description: '', inhaleTime: 4, holdTime: 4, exhaleTime: 4, cycles: 4, color: '#4F46E5', icon: 'Wind' },
            { id: '478', name: '4-7-8 Relax', description: '', inhaleTime: 4, holdTime: 7, exhaleTime: 8, cycles: 4, color: '#10B981', icon: 'Wind' }
          ];
          setExercises(fallback);
          setSelectedExercise(fallback[0]);
          setPhaseTimeLeft(fallback[0].inhaleTime);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, [isAuthenticated, isDemo]);

  // Audio Context Setup (Strictly No Any)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass && !audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Main Logic Loop
  useEffect(() => {
    if (isRunning && selectedExercise) {
      intervalRef.current = setInterval(() => {
        setPhaseTimeLeft((prevTime) => {
          if (prevTime > 1) return prevTime - 1;

          // Logic ganti fase menggunakan nilai state saat ini
          let nextPhase: "inhale" | "hold" | "exhale" = "inhale";
          let nextTime = 0;

          if (currentPhase === "inhale") {
            nextPhase = "hold";
            nextTime = selectedExercise.holdTime;
            playSound(440);
          } else if (currentPhase === "hold") {
            nextPhase = "exhale";
            nextTime = selectedExercise.exhaleTime;
            playSound(523);
          } else if (currentPhase === "exhale") {
            const nextCycleCount = currentCycle + 1;
            if (nextCycleCount >= selectedExercise.cycles) {
              handleFinishSession();
              return 0;
            }
            nextPhase = "inhale";
            nextTime = selectedExercise.inhaleTime;
            setCurrentCycle(nextCycleCount);
            playSound(349);
          }

          setCurrentPhase(nextPhase);
          return nextTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, selectedExercise, currentPhase, currentCycle, playSound, handleFinishSession]);

  // Animation variants
  const getAnimationVariants = (): Variants => {
    if (reducedMotion) return { initial: { scale: 1 }, animate: { scale: 1 } };
    const inhaleDuration = selectedExercise?.inhaleTime || 4;
    const exhaleDuration = selectedExercise?.exhaleTime || 4;
    const duration = currentPhase === "hold" ? 0.5 : (currentPhase === "inhale" ? inhaleDuration : exhaleDuration);
    
    return {
      initial: { scale: 0.9, opacity: 0.5 },
      animate: { 
        scale: currentPhase === "exhale" ? 0.9 : 1.25,
        opacity: 1,
        transition: { duration, ease: "easeInOut" }
      }
    };
  };

  return (
    <div className={cn(
      "container mx-auto p-6 max-w-7xl flex flex-col gap-8 relative",
      !isDemo && "min-h-[90vh]"
    )}>
      
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/40 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full">
              <GlassPanel className="p-10 text-center space-y-6 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Well done!</h2>
                  <p className="text-foreground/60 leading-relaxed text-lg text-foreground">
                    {isDemo 
                      ? "You've experienced a glimpse of Alora. Imagine tracking this daily to improve your focus." 
                      : "You have completed your ritual. You are now more centered, calm, and ready."}
                  </p>
                </div>
                <Button 
                  onClick={handleReset}
                  className="w-full h-14 rounded-2xl bg-foreground text-background text-lg font-semibold hover:scale-[1.02] transition-transform"
                >
                  {isDemo ? "Try Another Ritual" : "Return to Dashboard"}
                </Button>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI HEADER */}
<div className="flex flex-col md:flex-row justify-between items-end gap-4">
  {/* Judul cuma muncul kalau BUKAN demo, biar landing page lo gak double judul */}
  {!isDemo ? (
    <div className="space-y-1">
      <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent italic">
        Quiet the Mind
      </h1>
      <p className="text-foreground/50 font-medium text-sm">Controlled breathing for digital wellness.</p>
    </div>
  ) : (
    <div></div> // Spacer kosong biar toggle audio tetep di kanan
  )}

  {/* Toggle Audio - SEKARANG MUNCUL DI MANA SAJA */}
  <div className="flex items-center gap-3 p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
    <div className="flex items-center gap-2 px-3">
       <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-foreground">Audio</span>
       <Switch checked={isSoundEnabled} onCheckedChange={setIsSoundEnabled} className="scale-75" />
    </div>
  </div>
</div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <GlassPanel className={cn("relative flex flex-col items-center justify-center", isDemo ? "h-[500px]" : "h-[600px]")}>
            {selectedExercise ? (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-80 h-80 rounded-full border border-foreground/5 animate-[pulse_4s_infinite]" />
                  <motion.div
                    className="w-64 h-64 rounded-full flex items-center justify-center relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: selectedExercise.color }}
                    variants={getAnimationVariants()}
                    initial="initial"
                    animate={isRunning ? "animate" : "initial"}
                  >
                    <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
                    <div className="relative z-10 text-center text-white">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentPhase}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-[10px] uppercase tracking-[0.3em] font-black opacity-80 mb-1"
                        >
                          {currentPhase}
                        </motion.div>
                      </AnimatePresence>
                      <div className="text-6xl font-light tracking-tighter">{phaseTimeLeft}</div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-16 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={isRunning ? () => setIsRunning(false) : handleStart} 
                      size="lg" 
                      className="rounded-full w-20 h-20 bg-foreground text-background hover:scale-105 transition-transform"
                    >
                      {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                    </Button>
                    <Button onClick={handleReset} variant="ghost" size="icon" className="rounded-full hover:bg-foreground/5 h-12 w-12 text-foreground/60">
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                  {selectedExercise.cycles > 1 && (
                    <div className="px-4 py-1.5 rounded-full bg-foreground/5 text-[11px] font-bold uppercase tracking-widest opacity-60 text-foreground">
                      Cycle {currentCycle + 1} of {selectedExercise.cycles}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-foreground/30 flex flex-col items-center gap-4">
                <Wind className="h-12 w-12 stroke-[1px]" />
                <p className="font-medium tracking-tight">Select a ritual to begin</p>
              </div>
            )}
          </GlassPanel>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassPanel className="p-6">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-6 text-foreground">Breathing Rituals</h3>
            <div className="space-y-3">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { setSelectedExercise(ex); handleReset(); }}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 group",
                    selectedExercise?.id === ex.id 
                      ? "bg-foreground text-background shadow-lg shadow-foreground/10" 
                      : "hover:bg-foreground/5 bg-transparent border border-transparent text-foreground"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10" style={{ backgroundColor: ex.color }}>
                     <Wind className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ex.name}</div>
                    <div className={cn("text-[10px] uppercase tracking-wider font-bold opacity-50", 
                      selectedExercise?.id === ex.id ? "text-background/80" : ""
                    )}>
                      {ex.inhaleTime}s • {ex.holdTime}s • {ex.exhaleTime}s
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 bg-indigo-500/5 border-indigo-500/10">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 text-foreground">Pro Tip</h4>
                <p className="text-sm leading-relaxed text-foreground/70 italic text-foreground">
                  &quot;Focus on your diaphragm. Let your belly expand on inhale and contract on exhale.&quot;
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
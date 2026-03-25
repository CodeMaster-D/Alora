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

  // --- 1. Helper Functions ---
  
  // Suara Chime utama untuk ganti fase
  const playSound = useCallback((frequency: number) => {
    const ctx = audioContextRef.current;
    if (!isSoundEnabled || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [isSoundEnabled]);

  // Suara detak jam (tick) setiap detik
  const playTick = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!isSoundEnabled || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Bikin suara click/tick yang pendek
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime); // Pitch awal agak tinggi
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05); // Drop cepet banget
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime); // Volume kecil aja biar ga berisik
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); // Decay super cepat
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
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

  // Hitung durasi total untuk kelancaran progress ring animasi
  const getPhaseDuration = () => {
    if (!selectedExercise) return 4;
    return currentPhase === "inhale" ? selectedExercise.inhaleTime : 
           currentPhase === "hold" ? selectedExercise.holdTime : 
           selectedExercise.exhaleTime;
  };

  // --- 2. Effects ---

  // Fetch Data
  useEffect(() => {
    const fetchExercises = async () => {
      if (!isAuthenticated && !isDemo) return;
      
      try {
        const response = await firebaseService.breathing.getBreathingExercises();
        
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data;
          setExercises(data);
          setSelectedExercise(data[0]);
          setPhaseTimeLeft(data[0].inhaleTime);
        } else {
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

  // Audio Context Setup
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
        playTick(); // Memicu suara detak setiap detik berayun
        
        setPhaseTimeLeft((prevTime) => {
          if (prevTime > 1) return prevTime - 1;

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
  }, [isRunning, selectedExercise, currentPhase, currentCycle, playSound, playTick, handleFinishSession]);

  // Animation variants dengan Organic Easing
  const getAnimationVariants = (): Variants => {
    if (reducedMotion) return { initial: { scale: 1 }, animate: { scale: 1 } };
    
    const inhaleDuration = selectedExercise?.inhaleTime || 4;
    const exhaleDuration = selectedExercise?.exhaleTime || 4;
    
    return {
      initial: { scale: 1, opacity: 0.8 },
      inhale: { 
        scale: 1.35, 
        opacity: 1,
        transition: { duration: inhaleDuration, ease: [0.45, 0.05, 0.55, 0.95] } 
      },
      hold: { 
        scale: 1.35,
        transition: { duration: 0.5, ease: "linear" } 
      },
      exhale: { 
        scale: 1, 
        opacity: 0.8,
        transition: { duration: exhaleDuration, ease: [0.45, 0.05, 0.55, 0.95] } 
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
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/40"
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
                  <p className="text-foreground/60 leading-relaxed text-lg">
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 relative z-20">
        {!isDemo ? (
          <div className="space-y-1">
            <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent italic">
              Quiet the Mind
            </h1>
            <p className="text-foreground/50 font-medium text-sm">Controlled breathing for digital wellness.</p>
          </div>
        ) : (
          <div></div> 
        )}

        <div className="flex items-center gap-3 p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 px-3">
             <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-foreground">Audio</span>
             <Switch checked={isSoundEnabled} onCheckedChange={setIsSoundEnabled} className="scale-75" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        <div className="lg:col-span-8">
          <GlassPanel className={cn(
            "relative flex flex-col items-center justify-center overflow-hidden", 
            isDemo ? "h-[500px] md:h-[550px]" : "h-[600px]"
          )}>
            {selectedExercise ? (
              <>
                <div className={cn("relative flex items-center justify-center", isDemo ? "mt-4" : "mt-8")}>
                  
                  {/* Layer 1: Ambient Glow Pulse */}
                  <AnimatePresence>
                    {isRunning && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className={cn("absolute rounded-full", isDemo ? "w-64 h-64" : "w-80 h-80")}
                        style={{ backgroundColor: selectedExercise.color, filter: 'blur(50px)' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Layer 2: Smooth Progress Ring */}
                  <svg className={cn("absolute -rotate-90 pointer-events-none", isDemo ? "w-[280px] h-[280px]" : "w-[340px] h-[340px]")}>
                    <circle
                      cx={isDemo ? "140" : "170"} 
                      cy={isDemo ? "140" : "170"} 
                      r={isDemo ? "130" : "160"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="transparent"
                      className="text-foreground/10"
                    />
                    {isRunning && (
                      <motion.circle
                        key={`${currentPhase}-${currentCycle}`} 
                        cx={isDemo ? "140" : "170"} 
                        cy={isDemo ? "140" : "170"} 
                        r={isDemo ? "130" : "160"}
                        stroke={selectedExercise.color}
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={isDemo ? "816" : "1005"}
                        initial={{ strokeDashoffset: isDemo ? 816 : 1005 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: getPhaseDuration(), ease: "linear" }}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>

                  {/* Layer 3: Main Breathing Ball (Liquid Glass Effect) */}
                  <motion.div
                    className={cn(
                      "rounded-full flex items-center justify-center relative shadow-2xl",
                      isDemo ? "w-52 h-52" : "w-64 h-64"
                    )}
                    style={{ 
                      backgroundColor: selectedExercise.color,
                      boxShadow: `0 0 60px -15px ${selectedExercise.color}66`
                    }}
                    variants={getAnimationVariants()}
                    initial="initial"
                    animate={isRunning ? currentPhase : "initial"} 
                  >
                    {/* Glass Inner Reflection */}
                    <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
                    </div>

                    <div className="relative z-10 text-center text-white">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentPhase}
                          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                          transition={{ duration: 0.3 }}
                          className="text-[12px] uppercase tracking-[0.4em] font-black opacity-90 mb-1"
                        >
                          {currentPhase}
                        </motion.div>
                      </AnimatePresence>
                      
                      <motion.div 
                        key={phaseTimeLeft}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-7xl font-light tracking-tighter"
                      >
                        {phaseTimeLeft}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Controls */}
                <div className={cn("flex flex-col items-center gap-6 relative z-20", isDemo ? "mt-12" : "mt-20")}>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={isRunning ? () => setIsRunning(false) : handleStart} 
                      size="lg" 
                      className="rounded-full w-20 h-20 bg-foreground text-background shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      {isRunning ? <Pause fill="currentColor" className="w-8 h-8" /> : <Play fill="currentColor" className="ml-2 w-8 h-8" />}
                    </Button>
                    <Button onClick={handleReset} variant="ghost" size="icon" className="rounded-full hover:bg-foreground/10 h-12 w-12 text-foreground/60 transition-colors">
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                  {selectedExercise.cycles > 1 && (
                    <div className="px-5 py-2 rounded-full bg-foreground/5 backdrop-blur-md border border-foreground/5 text-[11px] font-bold uppercase tracking-widest opacity-70 text-foreground">
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
                    "w-full p-4 rounded-[20px] text-left transition-all duration-300 flex items-center gap-4 group",
                    selectedExercise?.id === ex.id 
                      ? "bg-foreground text-background shadow-lg shadow-foreground/20 scale-[1.02]" 
                      : "hover:bg-foreground/5 bg-transparent border border-transparent text-foreground hover:scale-[1.01]"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner" style={{ backgroundColor: ex.color }}>
                     <Wind className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{ex.name}</div>
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
              <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-500 shadow-inner">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 text-foreground">Pro Tip</h4>
                <p className="text-sm leading-relaxed text-foreground/70 italic">
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
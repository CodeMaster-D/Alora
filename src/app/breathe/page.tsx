"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Tambah Variants di sini
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BreathingExercise } from "@/types";
import { firebaseService } from "@/services/firebase";
import { useAccessibilityStore } from "../../store/useAccessbilityStore";
import { cn } from "@/lib/utils";

export default function BreathePage() {
  const { reducedMotion } = useAccessibilityStore();
  const [exercises, setExercises] = useState<BreathingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await firebaseService.breathing.getBreathingExercises();
        if (response.success && response.data) {
          setExercises(response.data);
          if (response.data.length > 0) {
            setSelectedExercise(response.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching breathing exercises:", error);
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    // FIX: Cara inisialisasi AudioContext yang lebih bersih untuk TS
    if (typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (isRunning && selectedExercise) {
      let phase: "inhale" | "hold" | "exhale" = "inhale";
      let timeLeft = selectedExercise.inhaleTime;
      let cycle = 0;

      intervalRef.current = setInterval(() => {
        timeLeft--;
        setPhaseTimeLeft(timeLeft);

        if (timeLeft <= 0) {
          if (phase === "inhale") {
            phase = "hold";
            timeLeft = selectedExercise.holdTime;
            playSound(440);
          } else if (phase === "hold") {
            phase = "exhale";
            timeLeft = selectedExercise.exhaleTime;
            playSound(523);
          } else if (phase === "exhale") {
            cycle++;
            setCurrentCycle(cycle);

            if (cycle >= selectedExercise.cycles) {
              setIsRunning(false);
              setIsCompleted(true);
              playSound(659);
              if (intervalRef.current) clearInterval(intervalRef.current);
            } else {
              phase = "inhale";
              timeLeft = selectedExercise.inhaleTime;
              playSound(349);
            }
          }
          setCurrentPhase(phase);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedExercise, isSoundEnabled]);

  const playSound = (frequency: number) => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.5);
  };

  const handleStart = () => {
    if (!selectedExercise) return;
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentPhase("inhale");
    setCurrentCycle(0);
    setPhaseTimeLeft(selectedExercise.inhaleTime);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentPhase("inhale");
    setCurrentCycle(0);
    if (selectedExercise) setPhaseTimeLeft(selectedExercise.inhaleTime);
  };

  const handleSelectExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    handleReset();
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case "inhale": return "Inhale";
      case "hold": return "Hold";
      case "exhale": return "Exhale";
      default: return "";
    }
  };

  const getAnimationDuration = () => {
    if (!selectedExercise) return 4;
    switch (currentPhase) {
      case "inhale": return selectedExercise.inhaleTime;
      case "hold": return 0.5;
      case "exhale": return selectedExercise.exhaleTime;
      default: return 4;
    }
  };

  // FIX: Tambahkan tipe kembalian : Variants supaya motion.div tidak error
  const getAnimationVariants = (): Variants => {
    if (reducedMotion) {
      return {
        initial: { scale: 1 },
        animate: { scale: 1 },
      };
    }

    return {
      initial: { scale: 0.8 },
      animate: { 
        scale: currentPhase === "inhale" ? 1.3 : currentPhase === "hold" ? 1.3 : 0.8,
        transition: { duration: getAnimationDuration(), ease: "easeInOut" }
      },
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Breathing Exercises</h1>
        <p className="text-muted-foreground">
          Practice controlled breathing to reduce stress and improve focus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{selectedExercise?.name || "Select an Exercise"}</CardTitle>
              <CardDescription>{selectedExercise?.description || "Choose a breathing exercise."}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
              {selectedExercise ? (
                <>
                  <div className="relative w-64 h-64 mb-8">
                    <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <motion.div
                      className="absolute inset-4 rounded-full"
                      style={{ backgroundColor: selectedExercise.color }}
                      variants={getAnimationVariants()} // Sekarang tipenya sudah cocok
                      initial="initial"
                      animate="animate"
                      key={`${currentPhase}-${currentCycle}`}
                    ></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <div>
                        <div className="text-3xl font-bold mb-2">{getPhaseText()}</div>
                        <div className="text-5xl font-bold">{phaseTimeLeft}</div>
                        {selectedExercise.cycles > 1 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            Cycle {currentCycle + 1} of {selectedExercise.cycles}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {!isRunning ? (
                      <Button onClick={handleStart} size="lg"><Play className="mr-2 h-5 w-5" /> Start</Button>
                    ) : (
                      <Button onClick={handlePause} size="lg"><Pause className="mr-2 h-5 w-5" /> Pause</Button>
                    )}
                    <Button onClick={handleReset} variant="outline" size="lg"><RotateCcw className="mr-2 h-5 w-5" /> Reset</Button>
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Switch id="sound" checked={isSoundEnabled} onCheckedChange={setIsSoundEnabled} />
                    <label htmlFor="sound" className="text-sm font-medium">Enable sound cues</label>
                    {isSoundEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <AnimatePresence>
                    {isCompleted && (
                      <motion.div 
                        className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="text-lg font-medium text-green-800 dark:text-green-200">Exercise completed!</div>
                        <div className="text-sm text-green-600 dark:text-green-300 mt-1">Take a moment to notice how you feel.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="text-center text-muted-foreground">Select a breathing exercise to get started.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* List Exercise Card */}
          <Card>
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>Choose a breathing exercise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedExercise?.id === exercise.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  )}
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: exercise.color }}>
                       {/* Icon logic tetap sama */}
                       {exercise.icon === "square" && <div className="w-5 h-5 bg-white"></div>}
                       {exercise.icon === "wind" && <div className="w-6 h-1 bg-white"></div>}
                       {exercise.icon === "lungs" && <div className="w-5 h-5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">{exercise.inhaleTime}s inhale, {exercise.holdTime}s hold, {exercise.exhaleTime}s exhale</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader><CardTitle>Tips</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div className="text-sm">Find a comfortable position and close your eyes if it helps you focus.</div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div className="text-sm">Try to breathe through your nose, unless it feels uncomfortable.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
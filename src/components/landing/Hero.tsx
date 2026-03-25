"use client";

import { useRef, useEffect } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  animate 
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wind, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Image from "next/image";

// Data Donut Chart Multi-Segment
const data = [
  { name: "Focus", value: 400 },
  { name: "Relax", value: 300 },
  { name: "Breathe", value: 300 },
];

const COLORS = ["#7EA385", "#94B49B", "#B4CFB0"]; 

// Komponen Counter khusus buat angka yang jalan
function CounterUp({ target, duration = 3 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    // Jalankan animasi dari 0 ke target
    const controls = animate(count, target, { duration: duration, ease: "easeOut" });
    return controls.stop;
  }, [count, target, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-background font-atkinson">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-pulse" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-10 z-20"
          >
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-foreground">
              Find Your <br />
              <span className="text-primary italic font-serif">Balance</span> <br />
              With Alora
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-foreground/60 leading-relaxed font-atkinson">
              Alora helps you balance your digital life through mindful breathing, 
              reflective journaling, and emotional tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Link href="/#breathe">
                <Button size="lg" className="rounded-2xl h-16 px-10 text-lg bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all duration-300">
                  Start Your Ritual
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-4 p-2 pl-4 pr-6 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md border-dashed text-foreground">
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Zap className="h-5 w-5" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] uppercase opacity-40 font-bold tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-semibold">Live Ritual</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT CONTENT */}
          <div className="relative h-[600px] lg:h-[750px] w-full flex items-center justify-center lg:justify-end">
            
            {/* MAIN IMAGE ASSET */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 z-0 flex items-center justify-center lg:justify-end"
            >
                <div className="relative w-full h-[90%] lg:w-[110%] lg:translate-x-10 lg:-translate-y-10 overflow-hidden rounded-r-[4rem]">
                    <Image 
                        src="/assets/hero4.png" 
                        alt="Wellness Asset"
                        fill
                        className="object-cover object-right opacity-95"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </motion.div>

            {/* DETAILING - WHITE GLASSMORPHISM WITH COUNTER */}
            <div className="absolute top-10 right-0 lg:right-[-2%] z-30 flex flex-col gap-5">
                {[
                    { icon: Wind, label: "Flow State", val: "Deep Focus", color: "text-emerald-600", bg: "bg-emerald-500/10" },
                    { icon: Heart, label: "Heart Rate", val: 72, suffix: " BPM", color: "text-rose-600", bg: "bg-rose-500/10" }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.2) }}
                        className="p-5 bg-white/40 backdrop-blur-[20px] border border-white/40 rounded-[2.5rem] flex items-center gap-4 w-56 shadow-none"
                    >
                        <div className={`h-11 w-11 ${item.bg} rounded-full flex items-center justify-center ${item.color}`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase opacity-60 font-bold leading-none mb-1 text-black">{item.label}</p>
                            <p className="text-sm font-semibold text-black">
                              {typeof item.val === 'number' ? (
                                <><CounterUp target={item.val} />{item.suffix}</>
                              ) : (
                                item.val
                              )}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* DONUT CHART - WHITE GLASSMORPHISM WITH COUNTER */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-32 left-0 lg:left-[-10%] z-40 p-10 bg-white/50 backdrop-blur-[15px] border border-white/50 rounded-[4rem] group shadow-none"
            >
                <div className="relative h-40 w-40 mx-auto">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                    
                    <ResponsiveContainer width="100%" height="100%" minHeight={150}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius="68%"
                                outerRadius="100%"
                                paddingAngle={12}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={25}
                                isAnimationActive={true}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold tracking-tighter text-black">
                          <CounterUp target={100} duration={2.5} />
                        </span>
                        <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold text-black">Zen Score</span>
                    </div>
                </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useRef, useState, useEffect } from "react";
import { 
  motion, useScroll, useSpring, useTransform, animate, useMotionValue, useInView 
} from "framer-motion";
import { Heart, Activity, Shield, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { 
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip,
  TooltipProps 
} from "recharts";
import { 
  ValueType, NameType 
} from "recharts/types/component/DefaultTooltipContent";

// --- Types ---
interface MoodData {
  date: string;
  mood: number;
}

interface ActivityData {
  name: string;
  value: number;
}

interface ProgressData {
  day: string;
  val: number;
}

// Interface khusus untuk casting payload Recharts
interface ChartPayload {
  date?: string;
  day?: string;
  mood?: number;
  val?: number;
}

// --- Data ---
const moodTrend: MoodData[] = [
  { date: "Mon", mood: 3 }, { date: "Tue", mood: 4.5 }, { date: "Wed", mood: 3.2 },
  { date: "Thu", mood: 5 }, { date: "Fri", mood: 4.2 }, { date: "Sat", mood: 5.5 },
  { date: "Sun", mood: 4.8 }
];

const activityDistribution: ActivityData[] = [
  { name: 'Rest', value: 400 },
  { name: 'Focus', value: 300 },
  { name: 'Social', value: 200 },
];

const dailyProgress: ProgressData[] = [
  { day: 'M', val: 65 }, { day: 'T', val: 45 }, { day: 'W', val: 85 },
  { day: 'T', val: 55 }, { day: 'F', val: 90 }, { day: 'S', val: 70 },
];

const THEME_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)"
];

// --- Components ---

function Counter({ value, duration = 5, trigger }: { value: number, duration?: number, trigger: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    if (trigger) {
      const controls = animate(count, value, { duration: duration, ease: "easeOut" });
      return controls.stop;
    }
    count.set(0);
  }, [value, count, duration, trigger]);

  return <motion.span>{rounded}</motion.span>;
}

/**
 * Custom Tooltip dengan Type Safety
 * Menggunakan casting 'as ChartPayload' untuk akses property date/day
 */
// 2. Gunakan fungsi standar tanpa destructuring di parameter
const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
  // Ambil value-nya dari props secara aman
  const { active, payload } = props;

  if (active && payload && payload.length) {
    // Casting data mentah ke interface yang kita buat
    const data = payload[0].payload as ChartPayload;
    
    return (
      <div className="bg-background/80 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
          {data.date || data.day}
        </p>
        <p className="text-sm font-bold text-primary">
          {payload[0].value}% Score
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardSection() {
  const [isMounted, setIsMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({ 
    target: sectionRef, 
    offset: ["start end", "end start"] 
  });

  const springRotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.5], [12, 0]), 
    { damping: 25, stiffness: 100 }
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacityValue = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  return (
    <section ref={sectionRef} className="py-32 relative bg-background overflow-hidden min-h-screen flex flex-col justify-center">
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0 opacity-10 bg-primary rounded-full blur-[150px]" />

      <article className="container mx-auto px-6 relative z-10">
        <header className="mb-16 text-center">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Ecosystem Analytics</motion.span>
          <motion.h3 className="text-4xl md:text-6xl font-bold tracking-tight">Your Mental <span className="italic font-serif text-accent">Progress.</span></motion.h3>
        </header>

        <figure className="relative w-full [perspective:2000px]">
          <motion.nav 
            style={{ rotateX: springRotateX, scale, opacity: opacityValue }} 
            className="mx-auto max-w-7xl w-full bg-background/60 dark:bg-foreground/[0.02] backdrop-blur-3xl border border-border rounded-[48px] overflow-hidden shadow-2xl"
          >
            <header className="px-8 py-6 border-b border-border flex justify-between items-center bg-foreground/[0.01]">
              <ul className="flex gap-2.5">
                <li className="w-3 h-3 rounded-full bg-red-500" />
                <li className="w-3 h-3 rounded-full bg-yellow-500" />
                <li className="w-3 h-3 rounded-full bg-green-500" />
              </ul>
              <span className="text-[10px] font-semibold font-black opacity-30 uppercase tracking-[0.2em]">User Dashboard Preview</span>
            </header>

            <section className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Donut Chart */}
              <aside className="lg:col-span-3 flex flex-col gap-6">
                <article className="p-8 rounded-[40px] bg-foreground/[0.02] border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <PieIcon className="h-5 w-5 text-secondary mb-4" />
                  <span className="text-[10px] uppercase font-black opacity-40 mb-2">Focus Split</span>
                  <div className="h-[180px] w-full">
                    {isMounted && isInView && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={activityDistribution} 
                            innerRadius={55} 
                            outerRadius={75} 
                            paddingAngle={10} 
                            cornerRadius={12} 
                            dataKey="value" 
                            stroke="none"
                          >
                            {activityDistribution.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={THEME_COLORS[i % THEME_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <p className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-2xl font-black italic text-primary">82%</p>
                </article>

                <article className="p-6 rounded-[32px] bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary animate-pulse" />
                    <div>
                      <p className="text-2xl font-bold italic">
                        {isMounted && <Counter value={74} trigger={isInView} />}
                        <span className="text-xs ml-1 opacity-50">bpm</span>
                      </p>
                      <span className="text-[9px] font-bold uppercase opacity-50">Resting Rate</span>
                    </div>
                  </div>
                </article>
              </aside>

              {/* Middle: Area Chart */}
              <main className="lg:col-span-6 bg-foreground/[0.02] rounded-[48px] p-8 border border-border h-[480px] flex flex-col">
                <header className="flex justify-between items-center mb-10">
                  <h4 className="font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />Mood Stability</h4>
                  <div className="bg-background/50 p-1 rounded-full border border-border flex gap-2 px-3">
                    <span className="text-[9px] font-black text-primary">WEEKLY</span>
                    <span className="text-[9px] font-black opacity-20">MONTHLY</span>
                  </div>
                </header>
                <div className="flex-1 w-full">
                  {isMounted && isInView && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodTrend}>
                        <defs>
                          <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          content={<CustomTooltip />} 
                          cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="var(--color-primary)" 
                          strokeWidth={4} 
                          fill="url(#primaryGlow)" 
                          animationDuration={2000} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </main>

              {/* Right Side: Bar Chart */}
              <aside className="lg:col-span-3 flex flex-col gap-6">
                <article className="p-8 rounded-[40px] bg-foreground/[0.02] border border-border flex-1 flex flex-col">
                  <BarChart3 className="h-5 w-5 text-accent mb-6" />
                  <span className="text-[10px] uppercase font-black opacity-40 mb-6">Social Energy</span>
                  <div className="flex-1">
                    {isMounted && isInView && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyProgress}>
                          <Bar 
                            dataKey="val" 
                            fill="var(--color-accent)" 
                            radius={[10, 10, 10, 10]} 
                            animationDuration={1500} 
                          />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fontWeight: 700, opacity: 0.3}} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="p-6 rounded-[32px] bg-accent text-accent-foreground">
                  <Shield className="h-5 w-5 mb-4 opacity-80" />
                  <p className="font-black leading-tight uppercase text-xs tracking-widest">Privacy Secured</p>
                  <p className="text-[10px] mt-1 opacity-80">Local-first data processing</p>
                </article>
              </aside>

            </section>
          </motion.nav>
        </figure>
      </article>
    </section>
  );
}
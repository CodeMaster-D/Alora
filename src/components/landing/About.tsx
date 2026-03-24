"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  useInView
} from "framer-motion";
import { wrap } from "@motionone/utils";
import { Wind, Heart, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Mindful Breathing",
    desc: "Science-backed patterns to reduce stress instantly.",
    icon: Wind,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Emotional Intelligence",
    desc: "Track your moods and discover what drives your feelings.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Instant Clarity",
    desc: "A clutter-free space designed for deep reflection.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Privacy First",
    desc: "Your data is encrypted and stays yours forever.",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

interface MarqueeProps {
  baseVelocity: number;
}

function InfiniteMarquee({ baseVelocity = 100 }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 300 });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const skewX = useTransform(smoothVelocity, [-1000, 1000], [-20, 20]);
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() !== 0) {
      moveBy += directionFactor.current * moveBy * velocityFactor.get();
    }
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex flex-nowrap overflow-hidden whitespace-nowrap py-4">
      <motion.div className="flex flex-nowrap gap-6" style={{ x, skewX }}>
        {[...Array(4)].map((_, outerIndex) => (
          <div key={outerIndex} className="flex gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "w-[350px] p-8 rounded-[40px] relative overflow-hidden transition-all duration-500",
                  "bg-primary/5 border border-primary/10 backdrop-blur-3xl",
                  "hover:bg-primary/10 hover:border-primary/20"
                )}
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

                <div className="relative z-10">
                  <div className={cn("p-3 w-fit rounded-2xl mb-6", f.bg)}>
                    <f.icon className={cn("h-6 w-6", f.color)} />
                  </div>
                  {/* UPDATE: Pakai text-foreground supaya adaptif */}
                  <h3 className="text-xl font-bold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-normal font-medium">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function About() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });

  return (
    <section 
      id="about" 
      ref={containerRef}
      className="py-32 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-6 mb-20 flex flex-col items-center text-center">
        <motion.div 
          className="max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* UPDATE: Pakai text-foreground */}
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
            Designed for the <br /> 
            <span className="text-[#7EA98A] italic font-serif">modern mind.</span>
          </h2>
          
          {/* UPDATE: Pakai text-foreground/90 */}
          <p className="text-lg md:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            Alora is a high-performance wellness platform by <span className="text-[#7EA98A] font-semibold">Djob Misael Melodi</span> and <span className="text-[#7EA98A] font-semibold">Farisya Fatanansyah</span>, bridging the gap between modern aesthetics and digital equity. Built with Next.js and Tailwind CSS, Alora democratizes mental health through inclusive tools—ensuring a functional, human-centric sanctuary accessible to everyone.
          </p>
        </motion.div>
      </div>

      <div className="relative py-12">
        <div 
          className="pointer-events-none absolute left-0 right-0 bottom-10 h-32 z-0 opacity-40 bg-gradient-to-r from-transparent via-[#7EA98A] to-transparent" 
          style={{ filter: 'blur(80px)' }}
        />

        <div className="relative z-10">
          <InfiniteMarquee baseVelocity={-1.5} />
        </div>
        
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background via-background/20 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background via-background/20 to-transparent z-20" />
      </div>
    </section>
  );
}
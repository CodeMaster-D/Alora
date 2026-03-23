"use client";

import React, { useState } from "react";
import { 
  Contrast, Accessibility, Volume2, VolumeX, 
  RotateCcw, Zap, ZapOff, X, Type 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useAccessibilityStore } from "@/store/useAccessbilityStore"; 
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ThemeType = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";
type FontFamily = "default" | "dyslexic" | "hyperlegible";

interface FontOption {
  id: FontFamily;
  name: string;
  sub: string;
  className: string;
}

const FONT_OPTIONS: FontOption[] = [
  { id: 'default', name: 'Inter Standard', sub: 'Modern & Bersih', className: '' },
  { id: 'dyslexic', name: 'OpenDyslexic', sub: 'Ramah Disleksia', className: 'font-dyslexic' },
  { id: 'hyperlegible', name: 'Atkinson Hyperlegible', sub: 'Fokus Keterbacaan', className: 'font-hyper' }
];

export function FloatingAccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const s = useAccessibilityStore();

  const withTooltip = (children: React.ReactNode, content: string) => (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      {/* Z-INDEX paling depan biar gak ketutup panel */}
      <TooltipContent 
        side="left" 
        className="z-[1000000] bg-popover/95 backdrop-blur-md border-primary/20 text-xs px-3 py-2 rounded-xl shadow-2xl font-normal"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-[999999]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              className="absolute bottom-24 right-0 w-[380px] bg-background/80 border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-6 backdrop-blur-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Accessibility className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg tracking-tight font-medium">Aksesibilitas</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Kustomisasi Pengalaman</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar font-normal">
                
                {/* GRID: TEMA & BAHASA */}
                <div className="grid grid-cols-2 gap-4 font-normal">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase ml-1">Visual Tema</label>
                    <select 
                      value={s.theme} 
                      onChange={(e) => s.setTheme(e.target.value as ThemeType)}
                      className="w-full bg-muted/40 border border-border/50 rounded-2xl px-3 py-2.5 text-sm outline-none cursor-pointer hover:bg-muted/60 transition-all font-normal"
                    >
                      <option value="system">Auto (System)</option>
                      <option value="light">Mode Terang</option>
                      <option value="dark">Mode Gelap</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase ml-1">Vokal Bahasa</label>
                    <select 
                      value={s.language} 
                      onChange={(e) => s.setLanguage(e.target.value)}
                      className="w-full bg-muted/40 border border-border/50 rounded-2xl px-3 py-2.5 text-sm outline-none cursor-pointer hover:bg-muted/60 transition-all font-normal"
                    >
                      <option value="id-ID">Indonesia</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                </div>

                {/* MAIN TOGGLES */}
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase ml-1">Preferensi Cepat</span>
                  <div className="bg-muted/20 rounded-[2rem] p-2 border border-border/40 space-y-1">
                    
                    {/* High Contrast */}
                    {withTooltip(
                      <div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleHighContrast()}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.highContrast ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            <Contrast className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Kontras Tinggi</span>
                            <span className="text-[10px] text-muted-foreground">Tingkatkan visibilitas teks</span>
                          </div>
                        </div>
                        {/* pointer-events-none biar kliknya ditangkap oleh parent div */}
                        <Switch checked={s.highContrast} className="pointer-events-none" />
                      </div>,
                      "Mengaktifkan warna kontras tinggi untuk keterbacaan maksimal"
                    )}

                    {/* Reduced Motion */}
                    {withTooltip(
                      <div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleReducedMotion()}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.reducedMotion ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            {s.reducedMotion ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Matikan Animasi</span>
                            <span className="text-[10px] text-muted-foreground">Kurangi gerakan layar</span>
                          </div>
                        </div>
                        <Switch checked={s.reducedMotion} className="pointer-events-none" />
                      </div>,
                      "Menghilangkan efek animasi transisi di seluruh aplikasi"
                    )}

                    {/* Screen Reader */}
                    {withTooltip(
                      <div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleScreenReader()}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.screenReader ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            {s.screenReader ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Asisten Suara</span>
                            <span className="text-[10px] text-muted-foreground">Bacakan elemen yang aktif</span>
                          </div>
                        </div>
                        <Switch checked={s.screenReader} className="pointer-events-none" />
                      </div>,
                      "Mengaktifkan narasi suara untuk membantu navigasi"
                    )}
                  </div>
                </div>

                {/* UKURAN FONT */}
                <div className="space-y-3 font-normal">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase ml-1">Skala Tipografi</span>
                  <div className="flex gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
                    {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                      <Button
                        key={size}
                        variant={s.fontSize === size ? "default" : "ghost"}
                        className={cn(
                          "flex-1 h-10 rounded-xl text-xs font-normal capitalize transition-all",
                          s.fontSize === size && "shadow-lg bg-primary"
                        )}
                        onClick={() => s.setFontSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* GANTI FONT */}
                <div className="space-y-3 pb-4">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase ml-1">Karakter Huruf</span>
                  <div className="grid grid-cols-1 gap-2">
                    {FONT_OPTIONS.map((f) => (
                      <Button 
                        key={f.id}
                        variant={s.fontFamily === f.id ? 'secondary' : 'outline'} 
                        className={cn(
                          "justify-between px-5 h-14 rounded-2xl border-border/50 hover:bg-muted/60 transition-all font-normal",
                          f.className,
                          s.fontFamily === f.id && "border-primary/50 bg-primary/5 shadow-inner"
                        )}
                        onClick={() => s.setFontFamily(f.id)}
                      >
                        <div className="flex flex-col items-start text-left font-normal">
                          <span className="text-sm">{f.name}</span>
                          <span className="text-[10px] opacity-60">{f.sub}</span>
                        </div>
                        {s.fontFamily === f.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full h-12 rounded-2xl text-xs font-medium shadow-lg shadow-destructive/10 hover:shadow-destructive/20 transition-all"
                  onClick={() => s.resetSettings()}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset ke Pengaturan Awal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRIGGER BUTTON UTAMA */}
        {withTooltip(
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-20 w-20 rounded-[2.2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 active:scale-90 border-4",
              s.highContrast 
                ? "bg-yellow-400 text-black border-black hover:bg-yellow-300" 
                : "bg-primary text-primary-foreground border-white/20"
            )}
          >
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              {isOpen ? <X className="h-10 w-10" /> : <Accessibility className="h-10 w-10" />}
            </motion.div>
          </Button>,
          isOpen ? "Tutup Menu" : "Aksesibilitas"
        )}
      </div>
    </TooltipProvider>
  );
}
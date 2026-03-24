"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Contrast, Accessibility, Volume2, VolumeX, 
  RotateCcw, Zap, ZapOff, X, Type, Sun, Moon, Monitor, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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

const THEME_OPTIONS = [
  { id: 'system' as ThemeType, label: 'Auto', icon: Monitor },
  { id: 'light' as ThemeType, label: 'Terang', icon: Sun },
  { id: 'dark' as ThemeType, label: 'Gelap', icon: Moon },
];

const LANGUAGE_OPTIONS = [
  { id: 'id-ID', label: 'Indonesia', flag: '🇮🇩' },
  { id: 'en-US', label: 'English', flag: '🇺🇸' },
];

export function FloatingAccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const s = useAccessibilityStore();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Slider value mapping: 0=small, 1=medium, 2=large
  const getSliderValue = () => {
    switch (s.fontSize) {
      case "small": return [0];
      case "large": return [2];
      default: return [1];
    }
  };

  const handleSliderChange = (value: number[]) => {
    const val = value[0];
    if (val === 0) s.setFontSize("small");
    else if (val === 2) s.setFontSize("large");
    else s.setFontSize("medium");
  };

  const getFontSizeLabel = () => {
    switch (s.fontSize) {
      case "small": return "Kecil";
      case "large": return "Besar";
      default: return "Sedang";
    }
  };

  // FIX: Tambahkan parameter `isAlwaysActive` agar tooltip tombol utama tidak terblokir state `isOpen`
  const withTooltip = (children: React.ReactNode, content: string, itemName: string, isAlwaysActive: boolean = false) => (
    <Tooltip 
      open={(isAlwaysActive ? true : isOpen) && hoveredItem === itemName}
      onOpenChange={(open) => setHoveredItem(open ? itemName : null)}
    >
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side="left" 
        sideOffset={12}
        className={cn(
          "px-4 py-2 text-xs rounded-xl border border-white/30 dark:border-white/10",
          "bg-white/20 dark:bg-black/20 backdrop-blur-md text-foreground shadow-2xl overflow-visible z-[1000000]"
        )}
      >
        <AnimatePresence mode="wait">
          {hoveredItem === itemName && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div ref={toolbarRef} className="fixed bottom-6 right-6 z-[999999]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-20 right-0 w-[340px] bg-background/80 border border-white/20 shadow-2xl rounded-[2rem] p-6 backdrop-blur-2xl overflow-hidden"
            >
              {/* HEADER */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-primary/10 rounded-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Accessibility className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg tracking-tight font-normal">Aksesibilitas</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Kustomisasi Pengalaman</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 font-normal scrollbar-hide">
                
                {/* GRID: TEMA & BAHASA - Minimalist Selection */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 gap-4 font-normal"
                >
                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-normal text-muted-foreground uppercase ml-1">Visual Tema</label>
                    <div className="flex flex-col gap-1">
                      {THEME_OPTIONS.map((theme) => {
                        const Icon = theme.icon;
                        const isSelected = s.theme === theme.id;
                        return (
                          <motion.button
                            key={theme.id}
                            onClick={() => s.setTheme(theme.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border",
                              isSelected 
                                ? "border-primary/50 bg-primary/5 text-foreground" 
                                : "border-border/50 hover:border-primary/30 hover:bg-muted/40 text-muted-foreground"
                            )}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="font-normal">{theme.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-normal text-muted-foreground uppercase ml-1">Vokal Bahasa</label>
                    <div className="flex flex-col gap-1">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = s.language === lang.id;
                        return (
                          <motion.button
                            key={lang.id}
                            onClick={() => s.setLanguage(lang.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border",
                              isSelected 
                                ? "border-primary/50 bg-primary/5 text-foreground" 
                                : "border-border/50 hover:border-primary/30 hover:bg-muted/40 text-muted-foreground"
                            )}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-base">{lang.flag}</span>
                            <span className="font-normal">{lang.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* MAIN TOGGLES */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <span className="text-[11px] font-normal text-muted-foreground uppercase ml-1">Preferensi Cepat</span>
                  <div className="bg-muted/20 rounded-[2rem] p-2 border border-border/40 space-y-1">
                    
                    {/* High Contrast */}
                    {withTooltip(
                      <motion.div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleHighContrast()}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.highContrast ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            <Contrast className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Kontras Tinggi</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Tingkatkan visibilitas teks</span>
                          </div>
                        </div>
                        <Switch checked={s.highContrast} className="pointer-events-none" />
                      </motion.div>,
                      "Mengaktifkan warna kontras tinggi untuk keterbacaan maksimal",
                      "high-contrast"
                    )}

                    {/* Reduced Motion */}
                    {withTooltip(
                      <motion.div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleReducedMotion()}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.reducedMotion ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            {s.reducedMotion ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Matikan Animasi</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Kurangi gerakan layar</span>
                          </div>
                        </div>
                        <Switch checked={s.reducedMotion} className="pointer-events-none" />
                      </motion.div>,
                      "Menghilangkan efek animasi transisi di seluruh aplikasi",
                      "reduced-motion"
                    )}

                    {/* Screen Reader */}
                    {withTooltip(
                      <motion.div 
                        className="flex items-center justify-between p-4 hover:bg-background/60 rounded-2xl transition-all cursor-pointer group"
                        onClick={() => s.toggleScreenReader()}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg transition-colors", s.screenReader ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10")}>
                            {s.screenReader ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-normal">Asisten Suara</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Bacakan elemen yang aktif</span>
                          </div>
                        </div>
                        <Switch checked={s.screenReader} className="pointer-events-none" />
                      </motion.div>,
                      "Mengaktifkan narasi suara untuk membantu navigasi",
                      "screen-reader"
                    )}
                  </div>
                </motion.div>

                {/* UKURAN FONT - SLIDER */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3 font-normal"
                >
                  <div className="flex items-center justify-between ml-1">
                    <span className="text-[11px] font-normal text-muted-foreground uppercase">Skala Tipografi</span>
                    <motion.span 
                      key={s.fontSize}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-primary font-normal"
                    >
                      {getFontSizeLabel()}
                    </motion.span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={getSliderValue()}
                      onValueChange={handleSliderChange}
                      max={2}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-normal px-1">
                      <span>A</span>
                      <span className="text-base">A</span>
                      <span className="text-lg">A</span>
                    </div>
                  </div>
                </motion.div>

                {/* GANTI FONT - Minimalist */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 pb-4"
                >
                  <span className="text-[11px] font-normal text-muted-foreground uppercase ml-1">Karakter Huruf</span>
                  <div className="grid grid-cols-1 gap-2">
                    {FONT_OPTIONS.map((f, index) => (
                      <motion.button
                        key={f.id}
                        className={cn(
                          "flex items-center justify-between px-5 py-3 rounded-2xl border transition-all font-normal text-left",
                          s.fontFamily === f.id 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-border/50 hover:border-primary/30 hover:bg-muted/40"
                        )}
                        onClick={() => s.setFontFamily(f.id)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <div className="flex flex-col items-start">
                          <span className={cn("text-sm font-normal", f.className)}>{f.name}</span>
                          <span className="text-[10px] opacity-60 font-normal">{f.sub}</span>
                        </div>
                        {s.fontFamily === f.id && (
                          <motion.div 
                            layoutId="fontIndicator"
                            className="h-2 w-2 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-2xl text-xs font-normal border-border/50 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all"
                      onClick={() => s.resetSettings()}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset ke Pengaturan Awal
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRIGGER BUTTON UTAMA - FIX: Tambahkan flag `true` sebagai argumen ke-4 agar tooltip selalu aktif di-hover */}
        {withTooltip(
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Button
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "h-14 w-14 rounded-full shadow-xl transition-all duration-500 border-0",
                s.highContrast 
                  ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <motion.div 
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Accessibility className="h-6 w-6" />}
              </motion.div>
            </Button>
          </motion.div>,
          isOpen ? "Tutup Menu" : "Aksesibilitas",
          "main-trigger",
          true // Argumen baru yang nge-bypass syarat `isOpen`
        )}
      </div>
    </TooltipProvider>
  );
}
"use client";

import { useState } from "react";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Contrast, 
  Type, 
  Minus, 
  Plus, 
  Accessibility, 
  Volume2,
  VolumeX,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibilityStore } from "../../store/useAccessbilityStore";
import { cn } from "@/lib/utils";

export function FloatingAccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    theme,
    highContrast,
    fontSize,
    fontFamily,
    reducedMotion,
    screenReader,
    setTheme,
    toggleHighContrast,
    setFontSize,
    setFontFamily,
    toggleReducedMotion,
    toggleScreenReader,
    resetSettings,
  } = useAccessibilityStore();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "dyslexic":
        return "font-dyslexic";
      case "hyperlegible":
        return "font-hyperlegible";
      default:
        return "";
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", getFontFamilyClass(), getFontSizeClass())}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Accessibility options"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Accessibility Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Theme Options */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center gap-2">
                {getThemeIcon()}
                <span>Theme</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          {/* High Contrast */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              <span>High Contrast</span>
            </div>
            <Switch checked={highContrast} onCheckedChange={toggleHighContrast} />
          </div>
          
          {/* Font Size */}
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4" />
              <span>Font Size</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize("small")}
                disabled={fontSize === "small"}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex-1 text-center">
                {fontSize === "small" && "Small"}
                {fontSize === "medium" && "Medium"}
                {fontSize === "large" && "Large"}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize("large")}
                disabled={fontSize === "large"}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Font Family */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span>Font Style</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setFontFamily("default")}>
                <span className="font-sans">Default</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontFamily("dyslexic")}>
                <span className="font-dyslexic">OpenDyslexic</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontFamily("hyperlegible")}>
                <span className="font-hyperlegible">Atkinson Hyperlegible</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          {/* Reduced Motion */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-current" />
              <span>Reduced Motion</span>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={toggleReducedMotion} />
          </div>
          
          {/* Screen Reader */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              {screenReader ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Screen Reader</span>
            </div>
            <Switch checked={screenReader} onCheckedChange={toggleScreenReader} />
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Reset Button */}
          <DropdownMenuItem onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset to Default</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
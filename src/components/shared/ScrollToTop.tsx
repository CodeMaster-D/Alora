"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAccessibilityStore } from "@/store/useAccessbilityStore";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { highContrast } = useAccessibilityStore();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-24 right-6 z-[999998]"
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl transition-all duration-500 border-0",
              highContrast 
                ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              "hover:scale-110"
            )}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

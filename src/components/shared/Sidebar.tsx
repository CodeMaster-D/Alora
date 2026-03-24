"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Home,
  Heart,
  BookOpen,
  Wind,
  BarChart3,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAccessibilityStore } from "@/store/useAccessbilityStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Breathe", href: "/breathe", icon: Wind },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Mood", href: "/mood", icon: Heart },
  { name: "Stats", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const { fontSize } = useAccessibilityStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showTooltips, setShowTooltips] = useState(true);

  const handleToggle = () => {
    setShowTooltips(false);
    toggleSidebar();
    setTimeout(() => setShowTooltips(true), 400);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small": return "text-sm";
      case "large": return "text-lg";
      default: return "text-base";
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "hidden md:relative md:block h-screen transition-all duration-500 z-50",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <div className={cn(
          "fixed m-4 h-[calc(100vh-2rem)] transition-all duration-500 flex flex-col rounded-[2rem] border shadow-2xl",
          "bg-card/60 backdrop-blur-xl border-white/20 dark:border-white/10",
          isCollapsed ? "w-16" : "w-64"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 mb-2">
            {!isCollapsed && (
              <motion.h2 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent ml-2 tracking-tight"
              >
                Alora
              </motion.h2>
            )}
            <Button variant="ghost" size="icon" onClick={handleToggle} className={cn("hover:bg-primary/10 transition-colors", isCollapsed && "mx-auto")}>
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </motion.div>
            </Button>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Tooltip 
                    key={item.name} 
                    open={isCollapsed && showTooltips && hoveredItem === item.name}
                    onOpenChange={(open) => {
                      if (isCollapsed) setHoveredItem(open ? item.name : null);
                    }}
                  >
                    <TooltipTrigger asChild>
                      <Link href={item.href} className="block w-full">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full rounded-2xl h-12 mb-1 transition-all group relative",
                            isCollapsed ? "justify-center px-0" : "justify-start px-4",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                              : "hover:bg-primary/10 text-muted-foreground hover:text-primary",
                            "font-normal tracking-wide",
                            getFontSizeClass()
                          )}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className={cn(!isCollapsed && "mr-3")}
                          >
                            <item.icon className="h-5 w-5" />
                          </motion.div>
                          {!isCollapsed && <span>{item.name}</span>}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    
                    {/* Tooltip Fix: Warna disesuaikan dengan Toolbar lo */}
                    {isCollapsed && (
                      <TooltipContent 
                        side="right" 
                        sideOffset={15} 
                        className="p-0 border-none bg-transparent shadow-none"
                      >
                        <AnimatePresence>
                          {hoveredItem === item.name && (
                            <motion.div
                              initial={{ opacity: 0, x: -10, scale: 0.95, filter: "blur(4px)" }}
                              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, x: -5, scale: 0.95, filter: "blur(4px)" }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className={cn(
                                "relative z-50 bg-white/20 dark:bg-black/20 backdrop-blur-md",
                                "border border-white/30 dark:border-white/10 rounded-xl px-4 py-2",
                                "text-xs font-semibold shadow-2xl flex items-center gap-2"
                              )}
                            >
                               <span className="tracking-wide">{item.name}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </ScrollArea>

          {/* Profile Section */}
          <div className="p-3 mt-auto border-t border-white/10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("w-full rounded-2xl h-16 transition-all hover:bg-primary/5", isCollapsed ? "justify-center px-0" : "justify-start px-3")}>
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/20 transition-all shadow-md">
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  {!isCollapsed && (
                    <div className="ml-3 text-left overflow-hidden">
                      <p className="text-sm font-normal truncate tracking-wide">{user?.displayName || "Guest"}</p>
                      <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest text-primary">Member</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" sideOffset={15} className="rounded-2xl backdrop-blur-xl bg-card/80 border-white/20 w-56 shadow-2xl border">
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  disabled={isLoading}
                  className="text-destructive rounded-xl m-1 font-medium focus:bg-destructive/10 cursor-pointer transition-colors"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
      >
        <div className="bg-card/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full h-14 flex items-center justify-start gap-2 px-3 ml-2 w-fit">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                }}
              >
                <Link href={item.href} className="relative flex flex-col items-center justify-center w-10 h-10">
                  {isActive && (
                    <motion.div layoutId="activeTabMobile" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  <item.icon className={cn("h-5 w-5 transition-colors duration-200", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    </TooltipProvider>
  );
}
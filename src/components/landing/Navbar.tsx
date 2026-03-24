"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  Sparkles,
  ChevronRight
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Breathe", href: "#breathe" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  // 1. Fix Hydration & "setMounted" Error
  // Pakai setTimeout 0 untuk memastikan ini jalan SETELAH initial render selesai total
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Handle Scroll & Hash Passive Sync
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const currentHash = window.location.hash;
      if (currentHash !== activeHash) {
        setActiveHash(currentHash);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted, activeHash]);

  // 3. Handle Pathname Change secara aman
  useEffect(() => {
    if (!mounted) return;

    // requestAnimationFrame memastikan UI sudah stabil sebelum menutup menu
    const closeMenuSafe = () => {
      requestAnimationFrame(() => {
        setIsMobileMenuOpen(false);
      });
    };

    closeMenuSafe();
  }, [pathname, mounted]);

  // Handler klik link supaya transisi hash & menu lebih sinkron
  const handleLinkClick = useCallback((href: string) => {
    setActiveHash(href);
    setIsMobileMenuOpen(false);
  }, []);

  // Cegah Hydration Mismatch
  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(
          "mx-auto max-w-7xl h-16 transition-all duration-500 pointer-events-auto",
          "flex items-center justify-between px-6 rounded-[2rem]",
          "border shadow-2xl",
          isScrolled 
            ? "bg-card/60 backdrop-blur-xl border-white/20 dark:border-white/10" 
            : "bg-card/30 backdrop-blur-xl border-white/10 dark:border-white/5"
        )}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent tracking-tight">
            Alora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeHash === link.href;

            return (
              <Button
                key={link.name}
                variant="ghost"
                asChild
                className={cn(
                  "relative h-10 px-4 rounded-2xl font-normal tracking-wide transition-all group",
                  isActive 
                    ? "text-primary-foreground" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
              >
                <Link href={link.href} onClick={() => handleLinkClick(link.href)}>
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-primary rounded-2xl -z-0 shadow-lg shadow-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild className="h-10 rounded-2xl px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all group">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
                <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex h-10 rounded-2xl font-medium hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="h-10 rounded-2xl px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all group">
                <Link href="/auth/register">
                  Join Alora
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-2xl h-10 w-10 hover:bg-primary/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </motion.nav>

     {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            // Transisi dibuat lebih pendek dan snappy
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="absolute top-24 left-4 right-4 z-[99] md:hidden pointer-events-auto"
          >
            <div className={cn(
              "p-6 rounded-[2rem] shadow-2xl border", 
              "bg-card/60 backdrop-blur-xl border-white/20 dark:border-white/10",
              // Tambahkan will-change supaya GPU siap duluan
              "will-change-[backdrop-filter,transform]"
            )}>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="ghost"
                    asChild
                    className="w-full justify-between h-12 px-4 rounded-2xl font-medium hover:bg-primary/10 group transition-colors"
                    onClick={() => handleLinkClick(link.href)}
                  >
                    <Link href={link.href}>
                      <span>{link.name}</span>
                      <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </Button>
                ))}
                
                {/* Auth section tetap sama */}
                <div className="h-[1px] bg-white/10 my-2" />
                {!isAuthenticated && (
                  <Button variant="ghost" asChild className="w-full h-12 rounded-2xl hover:bg-primary/10">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
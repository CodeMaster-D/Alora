"use client";

import Link from "next/link";
import { Sparkles, Globe, Share2, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent tracking-tight">
                Alora
              </span>
            </Link>
            <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
              Build a safe space for mental health by leveraging modern technology and design that is approachable.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="#home" className="text-sm text-foreground/60 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#about" className="text-sm text-foreground/60 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#breathe" className="text-sm text-foreground/60 hover:text-primary transition-colors">Breathing Exercises</Link></li>
              <li><Link href="/auth/login" className="text-sm text-foreground/60 hover:text-primary transition-colors">Login to Dashboard</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Features</h4>
            <ul className="space-y-4">
              <li><Link href="/mood" className="text-sm text-foreground/60 hover:text-primary transition-colors">Mood Tracking</Link></li>
              <li><Link href="/journal" className="text-sm text-foreground/60 hover:text-primary transition-colors">Journal</Link></li>
              <li><Link href="/breathe" className="text-sm text-foreground/60 hover:text-primary transition-colors">Breathing Exercises</Link></li>
              <li><Link href="/analytics" className="text-sm text-foreground/60 hover:text-primary transition-colors">Mental Health Analytics</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Contact Us</h4>
            <p className="text-sm text-foreground/60">Get the latest updates.</p>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="bg-card/40 border border-border/50 rounded-xl px-4 h-10 text-xs w-full focus:outline-none focus:border-primary/50 transition-all font-normal"
              />
              <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} Alora. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] uppercase font-normal tracking-widest hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[10px] uppercase font-normal tracking-widest hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

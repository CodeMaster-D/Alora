"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-[40px] p-8 md:p-16 bg-primary/5 border border-primary/10 backdrop-blur-3xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight">
              Have questions? <br /> Let&apos;s talk.
            </h2>
            <p className="text-foreground/50 max-w-md mx-auto">
              Whether you want to share feedback or just say hi, 
              our team is always here for you.
            </p>
            
            <form className="max-w-md mx-auto flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="Your email address"
                className="h-14 px-6 rounded-2xl bg-white/10 border border-white/20 focus:border-primary/50 focus:outline-none transition-all"
              />
              <Button size="lg" className="h-14 rounded-2xl bg-foreground text-background hover:scale-[1.01] transition-all">
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
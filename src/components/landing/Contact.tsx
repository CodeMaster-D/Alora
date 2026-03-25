"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { firebaseService } from "@/services/firebase";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast.error("Required Fields", {
        description: "Please provide both your email and a message.",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await firebaseService.contact.sendMessage({ email, message });
      if (response.success) {
        toast.success("Message Sent", {
          description: "We've received your message and will get back to you soon!",
        });
        setEmail("");
        setMessage("");
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast.error("Failed to Send", {
        description: error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-[40px] p-8 md:p-16 bg-primary/5 border border-primary/10 backdrop-blur-3xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground">
              Have questions? <br />Let&apos;s talk.
            </h2>
            <p className="text-foreground/50 max-w-md mx-auto">
              Whether you want to share feedback or just say hi, 
              our team is always here for you.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-6 rounded-2xl bg-white/10 border border-white/20 focus:border-primary/50 focus:outline-none transition-all text-foreground"
                required
              />
              <textarea 
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] p-6 rounded-2xl bg-white/10 border border-white/20 focus:border-primary/50 focus:outline-none transition-all text-foreground resize-none"
                required
              />
              <Button 
                type="submit"
                size="lg" 
                disabled={isSending}
                className="h-14 rounded-2xl bg-foreground text-background hover:scale-[1.01] transition-all"
              >
                {isSending ? (
                  <LoadingSpinner size="sm" text="Sending..." />
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { firebaseService } from "@/services/firebase";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

// Definisikan tipe error agar tidak pakai 'any'
interface FirebaseError {
  message: string;
}

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
        throw new Error(response.error || "Unknown error occurred");
      }
    } catch (error) {
      // FIX: Type guarding untuk error
      const errorMessage = (error as FirebaseError).message || "Something went wrong. Please try again later.";
      toast.error("Failed to Send", {
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-[40px] p-8 md:p-16 bg-foreground/[0.03] border border-border backdrop-blur-3xl relative overflow-hidden"
        >
          {/* Accent Glow - Pake primary color dari theme */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-8">
            <header className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground">
                Have questions? <br />
                <span className="italic font-serif text-primary">Let&apos;s talk.</span>
              </h2>
              <p className="text-foreground/60 max-w-md mx-auto">
                Whether you want to share feedback or just say hi, 
                our team is always here for you.
              </p>
            </header>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
              {/* Input: Gunakan bg-foreground/[0.03] agar adaptif Dark/Light & High Contrast */}
              <input 
                type="email" 
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-14 px-6 rounded-2xl bg-foreground/[0.03] border border-border",
                  "focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none",
                  "transition-all text-foreground placeholder:opacity-50"
                )}
                required
              />
              <textarea 
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(
                  "min-h-[140px] p-6 rounded-2xl bg-foreground/[0.03] border border-border",
                  "focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none",
                  "transition-all text-foreground placeholder:opacity-50 resize-none"
                )}
                required
              />
              
              <Button 
                type="submit"
                size="lg" 
                disabled={isSending}
                className="h-14 rounded-2xl bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
              >
                {isSending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Message
                    <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
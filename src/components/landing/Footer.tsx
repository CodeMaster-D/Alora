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
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent tracking-tight">
                Alora
              </span>
            </Link>
            <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
              Membangun ruang aman bagi kesehatan mental Anda melalui teknologi modern dan desain yang menenangkan.
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
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Navigasi</h4>
            <ul className="space-y-4">
              <li><Link href="#home" className="text-sm text-foreground/60 hover:text-primary transition-colors">Utama</Link></li>
              <li><Link href="#about" className="text-sm text-foreground/60 hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="#breathe" className="text-sm text-foreground/60 hover:text-primary transition-colors">Ritual Nafas</Link></li>
              <li><Link href="/auth/login" className="text-sm text-foreground/60 hover:text-primary transition-colors">Masuk Dashboard</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Fitur Utama</h4>
            <ul className="space-y-4">
              <li><Link href="/mood" className="text-sm text-foreground/60 hover:text-primary transition-colors">Pelacakan Mood</Link></li>
              <li><Link href="/journal" className="text-sm text-foreground/60 hover:text-primary transition-colors">Jurnal Harian</Link></li>
              <li><Link href="/breathe" className="text-sm text-foreground/60 hover:text-primary transition-colors">Latihan Nafas</Link></li>
              <li><Link href="/analytics" className="text-sm text-foreground/60 hover:text-primary transition-colors">Analisis Mental</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Kontak Kami</h4>
            <p className="text-sm text-foreground/60">Dapatkan update terbaru.</p>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Email Anda"
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
            © {new Date().getFullYear()} Alora. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] uppercase font-bold tracking-widest hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="text-[10px] uppercase font-bold tracking-widest hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

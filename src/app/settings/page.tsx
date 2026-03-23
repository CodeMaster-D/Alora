"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  HelpCircle,
  Info,
  Globe,
  Lock,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Menggunakan Sonner untuk notifikasi yang lebih modern
import { toast } from "sonner";

interface AppSettings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    reduceAnimations: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataCollection: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      language: 'id',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    },
    notifications: {
      email: true,
      push: true,
      inApp: true,
      frequency: 'daily',
    },
    appearance: {
      theme: 'system',
      accentColor: '#8b5cf6',
      fontSize: 'medium',
      reduceAnimations: false,
    },
    privacy: {
      profileVisibility: 'private',
      dataCollection: false,
      analytics: true,
      crashReporting: true,
    },
  });

  const handleSaveSettings = async (section: keyof AppSettings) => {
    setIsLoading(true);
    try {
      // Simulasi penyimpanan ke database
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Pengaturan ${section} berhasil diperbarui!`);
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      general: { language: 'id', timezone: 'Asia/Jakarta', dateFormat: 'DD/MM/YYYY', timeFormat: '24h' },
      notifications: { email: true, push: true, inApp: true, frequency: 'daily' },
      appearance: { theme: 'system', accentColor: '#8b5cf6', fontSize: 'medium', reduceAnimations: false },
      privacy: { profileVisibility: 'private', dataCollection: false, analytics: true, crashReporting: true },
    });
    toast.info("Pengaturan telah dikembalikan ke default");
  };

  const accentColors = [
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Rose', value: '#e11d48' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Pengaturan
            </h1>
            <p className="text-muted-foreground">Kelola preferensi aplikasi Alora Anda</p>
          </div>
          <Button variant="outline" onClick={handleResetSettings}>
            Reset Default
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="general" className="gap-2"><Globe className="h-4 w-4" /> Umum</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifikasi</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Tampilan</TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4" /> Privasi</TabsTrigger>
          </TabsList>

          {/* GENERAL SETTINGS */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
                <CardDescription>Atur bahasa dan format waktu dasar aplikasi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Bahasa Utama</Label>
                    <Select
                      value={settings.general.language}
                      onValueChange={(v) => setSettings(p => ({ ...p, general: { ...p.general, language: v } }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Format Waktu</Label>
                    <Select
                      value={settings.general.timeFormat}
                      onValueChange={(v) => setSettings(p => ({ ...p, general: { ...p.general, timeFormat: v as '12h' | '24h' } }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Jam (AM/PM)</SelectItem>
                        <SelectItem value="24h">24 Jam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <Button onClick={() => handleSaveSettings('general')} disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi & Pengingat</CardTitle>
                <CardDescription>Pilih bagaimana Anda ingin diingatkan untuk menulis jurnal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifikasi Push</Label>
                      <p className="text-sm text-muted-foreground">Terima pengingat langsung di perangkat Anda.</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.push} 
                      onCheckedChange={(v) => setSettings(p => ({ ...p, notifications: { ...p.notifications, push: v } }))} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Laporan Mingguan</Label>
                      <p className="text-sm text-muted-foreground">Email berisi ringkasan mood mingguan Anda.</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.email} 
                      onCheckedChange={(v) => setSettings(p => ({ ...p, notifications: { ...p.notifications, email: v } }))} 
                    />
                  </div>
                </div>
                <Button onClick={() => handleSaveSettings('notifications')} disabled={isLoading} className="mt-4">
                  Simpan Notifikasi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APPEARANCE */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Tampilan Aplikasi</CardTitle>
                <CardDescription>Personalisasi tema dan warna aplikasi agar nyaman di mata.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Tema Aplikasi</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <Button
                        key={t}
                        variant={settings.appearance.theme === t ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setSettings(p => ({ ...p, appearance: { ...p.appearance, theme: t } }))}
                      >
                        {t === 'light' ? 'Terang' : t === 'dark' ? 'Gelap' : 'Sistem'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Warna Aksen</Label>
                  <div className="flex gap-4">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSettings(p => ({ ...p, appearance: { ...p.appearance, accentColor: color.value } }))}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${settings.appearance.accentColor === color.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={() => handleSaveSettings('appearance')} disabled={isLoading}>
                  Terapkan Tampilan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIVACY */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan & Privasi</CardTitle>
                <CardDescription>Kontrol data Anda dan siapa yang bisa melihat profil Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2"><Lock className="h-4 w-4" /> Mode Privat</Label>
                      <p className="text-sm text-muted-foreground">Kunci jurnal Anda dengan enkripsi tambahan.</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.profileVisibility === 'private'} 
                      onCheckedChange={(v) => setSettings(p => ({ ...p, privacy: { ...p.privacy, profileVisibility: v ? 'private' : 'public' } }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2"><Eye className="h-4 w-4" /> Analitik Anonim</Label>
                      <p className="text-sm text-muted-foreground">Bantu kami meningkatkan aplikasi dengan data anonim.</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.analytics} 
                      onCheckedChange={(v) => setSettings(p => ({ ...p, privacy: { ...p.privacy, analytics: v } }))} 
                    />
                  </div>
                </div>
                <Button onClick={() => handleSaveSettings('privacy')} disabled={isLoading} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Perbarui Keamanan
                </Button>
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-medium">Butuh Bantuan?</span>
                  <Button variant="link" size="sm">Pusat Bantuan</Button>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Info className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-medium">Alora v1.2.4</span>
                  <Badge variant="outline">Terbaru</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
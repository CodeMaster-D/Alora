"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px] overflow-hidden transition-all duration-300",
    className
  )}>
    {children}
  </Card>
);

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error("Tolong isi semua bidang yang tersedia.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Konformasi password tidak sesuai.");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password terlalu pendek.", {
        description: "Minimal password adalah 6 karakter demi keamanan.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(formData.email, formData.password, formData.displayName);
      
      if (result.success) {
        setVerificationSent(true);
      } else {
        toast.error("Registrasi Gagal", {
          description: "Terjadi kendala saat membuat akun Anda. Coba beberapa saat lagi.",
        });
      }
    } catch {
      toast.error("Kesalahan sistem saat pendaftaran.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >

        <GlassCard className="p-2 sm:p-6">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-foreground">
                Join our Sanctuary
            </CardTitle>
            <CardDescription className="text-center font-medium text-foreground/50">
                Start your daily reflection journal today.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Full Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Type your full name here"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl bg-white/30 border-white/20 h-12 text-sm focus:ring-primary/20 focus:border-primary/40 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl bg-white/30 border-white/20 h-12 text-sm focus:ring-primary/20 focus:border-primary/40 transition-all shadow-inner"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="••••••••"
                        className="rounded-xl bg-white/30 border-white/20 h-12 text-sm pr-12 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-inner"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent rounded-full opacity-50 hover:opacity-100 transition-opacity"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="••••••••"
                        className="rounded-xl bg-white/30 border-white/20 h-12 text-sm pr-12 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-inner"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent rounded-full opacity-50 hover:opacity-100 transition-opacity"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
              </div>

              <div className="pt-4">
          <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white font-normal text-base shadow-xl shadow-[#D48C70]/20 transition-all active:scale-[0.98]" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        <span>Processing...</span>
                    </div>
                    ) : (
                    <>
                        <UserPlus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Create Account Now
                    </>
                    )}
                </Button>
              </div>
            </form>
            
            {verificationSent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Check Your Email!</h3>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      We&apos;ve sent a verification link to <span className="font-medium">{formData.email}</span>. 
                      Please click the link in your email to verify your account.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-foreground/50">Already have an account? </span>
              <Link href="/auth/login" className="text-[#D48C70] hover:text-[#D48C70]/80 transition-colors">
                Sign In
              </Link>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Komponen SVG Custom untuk Logo Google (Tanpa external library/package tambahan)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn(
    "bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px] overflow-hidden transition-all duration-300",
    className
  )}>
    {children}
  </Card>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in the email and password correctly.");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success("Login Successful!");
        router.push("/dashboard"); // Redirect manual untuk trigger client-side transition
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      toast.error("An error occurred while trying to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success("Login with Google Successful!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to login with Google.");
      }
    } catch (error) {
      toast.error("A system error occurred while trying to log in with Google.");
    } finally {
      setIsGoogleLoading(false);
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
        <GlassCard className="p-4 sm:p-8">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center font-medium text-foreground/50">
              Sign in to continue your mental health journey.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                  className="rounded-xl bg-white/30 border-white/20 h-12 text-sm focus:ring-[#D48C70]/20 focus:border-[#D48C70]/40 transition-all shadow-inner"
                />
              </div>
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
                    className="rounded-xl bg-white/30 border-white/20 h-12 text-sm pr-12 focus:ring-[#D48C70]/20 focus:border-[#D48C70]/40 transition-all shadow-inner"
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
              
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white font-normal text-base shadow-xl shadow-[#D48C70]/20 transition-all active:scale-[0.98]" 
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/20 dark:border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-widest font-normal text-foreground/40">Or</span>
              <div className="flex-grow border-t border-white/20 dark:border-white/10"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSubmit}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-14 rounded-2xl bg-[#FFFFFF] hover:bg-white/80 border-white/30 text-foreground font-normal shadow-sm transition-all active:scale-[0.98]"
            >
              {isGoogleLoading ? (
                 <div className="flex items-center gap-2">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                   <span>Connecting to Google...</span>
                 </div>
              ) : (
                <>
                  <GoogleIcon />
                  Login with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-sm font-medium">
              <span className="text-foreground/50">Don&apos;t have an account? </span>
              <Link href="/auth/register" className="text-[#D48C70] hover:text-[#D48C70]/80 transition-colors">
                register now
              </Link>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}

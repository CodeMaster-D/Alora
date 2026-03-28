"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle,
  Eye,
  EyeOff,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

type ActionMode = "verifyEmail" | "resetPassword" | "recoverEmail" | "verifyAndChangeEmail";
type Status = "loading" | "success" | "error" | "pending";

interface ActionData {
  mode: ActionMode;
  email?: string;
  previousEmail?: string;
  newEmail?: string;
  continueUrl?: string;
  error?: string;
}

function ActionHandlerContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode") as ActionMode | null;
  
  const { checkEmailVerified, sendVerificationEmail } = useAuthStore();
  
  const [status, setStatus] = useState<Status>("loading");
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleAction = async () => {
      if (!mode || !oobCode) {
        setStatus("error");
        setActionData({ mode: "verifyEmail", error: "Missing action code or mode" });
        return;
      }

      try {
        const response = await fetch(`/api/auth/action?oobCode=${oobCode}&mode=${mode}`);
        const data = await response.json();

        if (data.success) {
          setActionData({
            mode: data.mode,
            email: data.email,
            previousEmail: data.previousEmail,
            newEmail: data.newEmail,
            continueUrl: data.continueUrl
          });
          setStatus(data.mode === "resetPassword" ? "pending" : "success");
          
          if (data.mode === "verifyEmail") {
            await checkEmailVerified();
            toast.success("Email verified successfully!");
          }
        } else {
          setStatus("error");
          setActionData({ mode, error: data.error });
          toast.error(data.error || "Action failed");
        }
      } catch {
        setStatus("error");
        setActionData({ mode, error: "Failed to process action" });
        toast.error("Failed to process action");
      }
    };

    handleAction();
  }, [oobCode, mode, checkEmailVerified]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!oobCode) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oobCode,
          mode: "resetPassword",
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setActionData({ mode: "resetPassword" });
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverEmail = async () => {
    if (!oobCode) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oobCode,
          mode: "recoverEmail"
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        toast.success("Email recovered successfully!");
      } else {
        toast.error(data.error || "Failed to recover email");
      }
    } catch {
      toast.error("Failed to recover email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const result = await sendVerificationEmail();
      if (result.success) {
        toast.success("Verification email sent!");
      } else if (result.rateLimited) {
        toast.error("Too many requests. Please wait a few minutes and try again.");
      } else {
        toast.error("Failed to send verification email");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      toast.error("Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-10 h-10 text-[#D48C70] animate-spin" />
              <p className="text-foreground/60">Processing...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Action Failed</h2>
                  <p className="text-foreground/60">
                    {actionData?.error || "This link may have expired or is invalid."}
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "/auth/login"}
                  className="w-full h-12 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (actionData?.mode === "resetPassword" && status === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#D48C70]/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#D48C70]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                <p className="text-foreground/60 mt-2">
                  {actionData.email ? `Reset password for ${actionData.email}` : "Create a new password"}
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs uppercase tracking-widest font-bold opacity-60">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="rounded-xl bg-white/30 border-white/20 h-12 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent opacity-50"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest font-bold opacity-60">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="rounded-xl bg-white/30 border-white/20 h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (actionData?.mode === "recoverEmail") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Email Change Alert</h2>
                <p className="text-foreground/60 mt-2">Your email was recently changed</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-bold mb-1">Previous Email</p>
                  <p className="text-foreground font-medium">{actionData.previousEmail}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-1">New Email</p>
                  <p className="text-foreground font-medium">{actionData.newEmail}</p>
                </div>
              </div>

              <p className="text-sm text-foreground/60 text-center mb-6">
                If you didn&apos;t make this change, recover your original email.
              </p>

              <Button
                onClick={handleRecoverEmail}
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Recover Original Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              {actionData?.mode === "verifyEmail" && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
                    <p className="text-foreground/60">
                      Your email has been verified. Welcome to Alora!
                    </p>
                  </div>
                </>
              )}

              {actionData?.mode === "verifyAndChangeEmail" && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Email Updated!</h2>
                    <p className="text-foreground/60">
                      Your email has been changed to {actionData.newEmail}.
                    </p>
                  </div>
                </>
              )}

              {actionData?.mode === "resetPassword" && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Password Reset!</h2>
                    <p className="text-foreground/60">
                      Your password has been reset successfully.
                    </p>
                  </div>
                </>
              )}

              <div className="w-full space-y-3">
                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full h-12 rounded-2xl bg-[#D48C70] hover:bg-[#D48C70]/90 text-white"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/auth/login"}
                  className="w-full h-12 rounded-2xl border-[#D48C70]/30 text-[#D48C70]"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <Card className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[32px]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#D48C70] animate-spin" />
            <p className="text-foreground/60">Loading...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ActionHandlerContent />
    </Suspense>
  );
}

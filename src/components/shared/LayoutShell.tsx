"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/shared/Sidebar";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { setCollapsed } = useSidebarStore();

  // Reset sidebar state to expanded when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      setCollapsed(false);
    }
  }, [isAuthenticated, setCollapsed]);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Sidebar hanya muncul jika user sudah login */}
      {isAuthenticated && <Sidebar />}
      
      <main className={cn(
        "flex-1 w-full pb-24 md:pb-0 transition-all duration-300 ease-in-out",
        !isAuthenticated && "max-w-full" // Full width jika landing page
      )}>
        {children}
      </main>
    </div>
  );
}

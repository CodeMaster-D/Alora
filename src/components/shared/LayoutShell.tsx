"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/shared/Sidebar";
import { useSidebarStore } from "@/store/useSidebarStore";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { setCollapsed } = useSidebarStore();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Reset sidebar state to expanded when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      setCollapsed(false);
    }
  }, [isAuthenticated, setCollapsed]);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Sidebar hanya muncul jika user sudah login dan BUKAN di landing page */}
      {isAuthenticated && !isLandingPage && <Sidebar />}
      
      <main className={cn(
        "flex-1 w-full pb-24 md:pb-0 transition-all duration-300 ease-in-out",
        (!isAuthenticated || isLandingPage) && "max-w-full" // Full width jika landing page atau belum login
      )}>
        {children}
      </main>
    </div>
  );
}

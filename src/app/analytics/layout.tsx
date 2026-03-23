import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";

export default function AnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Area konten utama yang bisa di-scroll */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
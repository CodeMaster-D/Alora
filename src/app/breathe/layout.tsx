import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";

export default function BreatheLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
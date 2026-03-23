import { ReactNode } from "react";
import { Sidebar } from "../../components/shared/Sidebar";

export default function MoodLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Main content buat halaman Mood tracking */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
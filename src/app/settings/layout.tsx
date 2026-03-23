import React from "react";
import { Metadata } from "next";
import { Sidebar } from "../../components/shared/Sidebar";

export const metadata: Metadata = {
  title: "Pengaturan | Alora",
  description: "Kelola preferensi akun dan tampilan aplikasi Alora Anda.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar tetap di posisi kiri */}
      <Sidebar />
      
      {/* Konten halaman Settings yang bisa di-scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
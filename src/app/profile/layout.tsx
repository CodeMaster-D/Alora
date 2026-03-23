// app/profile/layout.tsx
import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full">
      {/* Ini adalah wrapper untuk halaman profile */}
      {children}
    </div>
  );
}
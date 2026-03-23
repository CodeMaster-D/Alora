// app/analytics/layout.tsx
import { ReactNode } from "react";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  // CUKUP RETURN CHILDREN SAJA
  // Hapus import Sidebar dan div flex yang membungkusnya di sini
  return <>{children}</>;
}
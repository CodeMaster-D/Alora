import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip"; // Tambahkan ini biar Tooltip shadcn jalan
import { FloatingAccessibilityToolbar } from "@/components/shared/FloatingAccessibilityToolbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alora - Mental Health & Accessibility",
  description: "A mental health and accessibility web app designed to support your wellbeing journey.",
  keywords: "mental health, accessibility, wellness, journaling, mood tracking",
  authors: [{ name: "Alora Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning di html sudah benar untuk next-themes
    <html lang="en" suppressHydrationWarning>
      {/* Tambahkan suppressHydrationWarning di body untuk blokir error ekstensi browser */}
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* TooltipProvider wajib ada supaya Tooltip di Sidebar/Toolbar lu gak crash */}
          <TooltipProvider delayDuration={300}>
            <div className="relative flex min-h-screen flex-col bg-background text-foreground">
              
              {/* Main Content Wrapper */}
              <main className="flex-1">
                {children}
              </main>

              {/* Komponen Global */}
              <FloatingAccessibilityToolbar />
              <Toaster richColors closeButton position="top-right" />
              
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
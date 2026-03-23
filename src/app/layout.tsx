import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingAccessibilityToolbar } from "@/components/shared/FloatingAccessibilityToolbar";
import { Sidebar } from "@/components/shared/Sidebar";
import { AccessibilityManager } from "@/components/shared/accessibility-manager"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alora - Mental Health & Accessibility",
  description: "A mental health and accessibility web app designed to support your wellbeing journey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityManager>
            <TooltipProvider delayDuration={300}>
              <div className="relative flex min-h-screen bg-background text-foreground overflow-x-hidden">
                <Sidebar />
                <main className="flex-1 w-full pb-24 md:pb-0 transition-all duration-300 ease-in-out">
                  {children}
                </main>
                <FloatingAccessibilityToolbar />
                <Toaster richColors closeButton position="top-right" />
              </div>
            </TooltipProvider>
          </AccessibilityManager>
        </ThemeProvider>
      </body>
    </html>
  );
}
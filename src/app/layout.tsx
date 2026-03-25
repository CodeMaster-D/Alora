import { Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import { FloatingAccessibilityToolbar } from "@/components/shared/FloatingAccessibilityToolbar";
import { LayoutShell } from "@/components/shared/LayoutShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Alora - Mental Health Companion",
  description: "A digital sanctuary for your mental well-being.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <LayoutShell>
            {children}
            <FloatingAccessibilityToolbar />
          </LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
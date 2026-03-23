# Alora AI Coding Standards (Next.js 15+ / React 19)

## 1. TECH STACK & ARCHITECTURE
- **Framework:** Next.js 15 (App Router)
- **React:** Version 19 (Use React Compiler, avoid manual useMemo/useCallback)
- **Styling:** Tailwind CSS v4 (@theme directive in globals.css)
- **Components:** Shadcn UI (Radix-based) located in `src/components/ui`
- **Icons:** Lucide React
- **State:** Zustand with `persist` middleware
- **Backend Ready:** Firebase v10+ (Service layer in `src/services/firebase`)

## 2. PROJECT STRUCTURE (Feature-Sliced Design)
- All source code must be in the `src/` directory.
- `src/app`: Routes and Page Layouts.
- `src/components/shared`: Global UI (Sidebar, Navbar, Toolbar).
- `src/features`: Domain logic (e.g., `src/features/mood`, `src/features/journal`).
- `src/store`: Zustand stores.
- `src/services`: Firebase mock/real logic.

## 3. ACCESSIBILITY (WCAG 2.1) - MANDATORY
- Use semantic HTML tags.
- Use `aria-label` for interactive elements without text.
- Implement High Contrast mode using `next-themes` and CSS variables.
- Support Accessibility Fonts: **OpenDyslexic** and **Atkinson Hyperlegible**.
- Ensure keyboard focus states are visible.

## 4. CODING RULES
- Use **TypeScript** with strict interfaces (no `any`).
- Use **Server Components** by default. Use `"use client"` ONLY for interactivity.
- Use **Sonner** for toasts.
- Wrap the app with `TooltipProvider` (Shadcn) and `ThemeProvider` (next-themes) in `layout.tsx`.
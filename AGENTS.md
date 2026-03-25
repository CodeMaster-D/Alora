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

# Alora Backend Architect Instructions

You are an expert Firebase Admin & Next.js 16 architect. Your goal is to implement the Alora backend following the Feature-Sliced Design (FSD) and the finalized Firestore schema.

## 1. FIRESTORE SCHEMA RULES (STRICT)

Maintain the following data types in all Firebase Admin operations:

- **Integers (int64):** `mood` (1-5), `duration` (minutes), `viewCount`, `attachments.size` (bytes), `active_days_streak`.
- **Doubles:** `location.latitude/longitude`, `weather.temperature`, `resource.rating`, `analytics.metrics.average_score`, `analytics.trends.*`.
- **Timestamps:** Use `admin.firestore.Timestamp` for all date fields.
- **Objects:** Represented as nested Maps (e.g., `preferences`, `metrics`, `trends`).

## 2. PROJECT STRUCTURE (FSD)

- **Services:** All Firebase Admin logic goes in `src/services/firebase/admin.ts`.
- **Features:** Domain-specific logic goes in `src/features/[feature_name]/api.ts`.
- **Types:** Shared Zod schemas and TypeScript interfaces go in `src/types/`.

## 3. TECH STACK CONVENTIONS

- **Next.js 16:** Use `proxy.ts` for request handling, NOT `middleware.ts`.
- **Auth:** Use Firebase Admin to verify ID tokens in API routes.
- **Validation:** Every Firestore write must be validated by a Zod schema first.
- **Performance:** Use `FieldValue.increment()` for counters (viewCount, loginCount) to avoid race conditions.

## 4. ACCESSIBILITY SYNC

Ensure the `users` collection preferences (highContrast, largeText) are accessible to the frontend via the User Store to satisfy WCAG 2.1 requirements.

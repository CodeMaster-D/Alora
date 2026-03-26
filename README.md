# Alora - Mental Wellness Platform

![Alora](public/assets/hero4.png)

> **Alora** is a premium mental wellness web application built to help users balance their digital life through mindful breathing exercises, reflective journaling, and emotional tracking - all backed by Firebase Firestore in real-time.

---

## Features

| Feature | Description |
| --- | --- |
| **Breathing Rituals** | Guided breathing exercises (Box, 4-7-8, etc.) with animated visual timer and optional audio cues |
| **Mood Journal** | Daily mood check-ins with emoji selection, emotion tags, custom notes, and grouped history view |
| **Reflective Journal** | Rich text journal entries with tags, mood annotation, privacy toggle, and voice-to-text input |
| **Analytics** | Mood trajectory charts, distribution pie chart, and factor correlation analysis |
| **Daily Streak** | Server-side streak calculation via Firebase Admin SDK, persisted in Zustand |
| **Accessibility** | High Contrast mode, Reduced Motion, font switching (OpenDyslexic / Atkinson Hyperlegible), keyboard navigation |
| **Dark / Light Mode** | Full dark mode via `next-themes`, synchronized with system preference |
| **Contact Form** | Landing page contact form that persists messages to Firestore |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| React | 19 with React Compiler |
| Styling | Tailwind CSS v4 (`@theme` directive) |
| Components | Shadcn UI (Radix-based) |
| Animations | Framer Motion |
| State | Zustand with `persist` middleware |
| Backend | Firebase Firestore (Client SDK) + Firebase Admin (Server) |
| Auth | Firebase Authentication (Email/Password + Google) |
| Toasts | Sonner |
| Charts | Recharts |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/alora.git
cd alora
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Client SDK (from Firebase Console > Project Settings > Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (from Firebase Console > Project Settings > Service Accounts)
# Paste the entire JSON content of the downloaded service account key as a single line
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

### 3. Configure Firestore Security Rules

In the **Firebase Console → Firestore Database → Rules**, replace all existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow get, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    match /moods/{moodId} {
      allow list  : if request.auth != null;
      allow get   : if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /journals/{journalId} {
      allow list  : if request.auth != null;
      allow get   : if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /breathing_sessions/{sessionId} {
      allow list  : if request.auth != null;
      allow get   : if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /breathing_exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /contact_messages/{msgId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    match /analytics/{analyticsId} {
      allow list  : if request.auth != null;
      allow get   : if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /resources/{resourceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

> ️ **Important**: The rules split `read` into `get` and `list`. This is required because Firestore list queries have `resource == null`, so checking `resource.data.userId` in a generic `read` rule always fails.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Application Flow

```text
Landing Page (/)
  ├── Sign In  → /auth/login
  ├── Register → /auth/register
  └── (Authenticated) → redirect to /dashboard

Dashboard (/dashboard)
  ├── Mood Journal  (/mood)      - log & view mood history
  ├── Journal       (/journal)   - write & manage journal entries
  ├── Breathe       (/breathe)   - run breathing exercise sessions
  ├── Analytics     (/analytics) - charts & insights
  └── Profile       (/profile)   - settings & accessibility
```

---

## Project Structure

```text
src/
├── app/               # Next.js App Router pages
│   ├── auth/          # Login & Register
│   ├── dashboard/     # Main dashboard
│   ├── mood/          # Mood Journal
│   ├── journal/       # Journal CRUD
│   ├── breathe/       # Breathing exercises
│   ├── analytics/     # Analytics charts
│   ├── api/           # Server-side API routes
│   └── profile/       # User profile & settings
├── components/
│   ├── landing/       # Landing page sections (Navbar, Hero, Footer, etc.)
│   ├── shared/        # Layout shell, Sidebar, Accessibility Toolbar
│   └── ui/            # Shadcn UI component library
├── features/          # Domain logic (mood, journal, users)
├── services/
│   └── firebase/      # Firebase Client & Admin SDK setup
├── store/             # Zustand stores (auth, journal, sidebar, accessibility)
└── types/             # TypeScript interfaces & Zod schemas
```

---

## Accessibility Features (WCAG 2.1)

The **Floating Accessibility Toolbar** (bottom-right corner) provides:

- **High Contrast Mode** - increases colour contrast ratios across the entire UI
- **Reduced Motion** - disables all Framer Motion animations
- **Font: OpenDyslexic** - dyslexia-friendly typeface
- **Font: Atkinson Hyperlegible** - designed for low-vision readers
- **Font Size** - Small / Medium / Large presets
- Keyboard focus rings visible on all interactive elements
- Semantic HTML structure throughout
- `aria-label` attributes on all icon-only buttons

---

## Authentication Notes

- Email/Password and Google Sign-In are supported.
- On registration, a `users/{uid}` document is created in Firestore with default preferences.
- A **daily streak** is calculated server-side via `/api/user/streak` using Firebase Admin SDK.
- Auth state is persisted in `localStorage` via Zustand's `persist` middleware, plus an `isAuthenticated` cookie for the middleware route guard (`src/proxy.ts`).

---

## License

MIT - Built with ️<3 for Alora.

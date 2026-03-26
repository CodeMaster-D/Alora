# [cite_start]ALORA - Mental Wellness Platform [cite: 138]

## [cite_start]Institusi [cite: 138]
SMK Telkom 1 Medan

## [cite_start]Anggota Tim [cite: 138]
- [cite_start]Ketua: Djob Misael [cite: 138]
- [cite_start]Anggota 1: Farisya Fatanansyah [cite: 138]

## [cite_start]Deskripsi Karya [cite: 138]
[cite_start]Alora adalah platform kesehatan mental premium yang dirancang untuk membantu pengguna menyeimbangkan kehidupan digital melalui latihan pernapasan mindful, jurnal reflektif, dan pelacakan emosi secara real-time[cite: 15, 88, 138].

### [cite_start]Subtema [cite: 20]
3. [cite_start]Kesehatan [cite: 23]

### [cite_start]Latar Belakang [cite: 138]
[cite_start]Dalam perkembangan teknologi informasi yang pesat, website tidak hanya sekadar media informasi, tetapi juga sarana edukasi interaktif untuk meningkatkan kesadaran masyarakat terhadap isu kesehatan mental[cite: 10]. [cite_start]Alora hadir sebagai inovasi digital yang menggabungkan estetika visual dengan dampak sosial positif bagi masyarakat[cite: 12, 19].

### [cite_start]Tujuan [cite: 138]
- [cite_start]Mewadahi kreativitas dalam perancangan website yang mengintegrasikan aspek estetika, fungsionalitas, dan kenyamanan pengguna secara optimal[cite: 27, 28].
- [cite_start]Mendorong pemanfaatan teknologi secara strategis untuk menciptakan solusi digital yang bermanfaat dalam menyampaikan informasi kesehatan mental secara efektif[cite: 29, 30].

### [cite_start]Manfaat [cite: 138]
- [cite_start]Memberikan sarana bagi pengguna untuk melakukan refleksi diri dan pengelolaan emosi melalui fitur interaktif yang responsif[cite: 17, 121, 130].
- [cite_start]Menyediakan aksesibilitas digital yang inklusif bagi berbagai kalangan pengguna untuk meningkatkan kualitas hidup[cite: 12, 34].

## [cite_start]Link Website [cite: 139]
[cite_start]https://alora.web.id [cite: 139]

---

## Technical Overview

### Key Features
| Feature | Description |
| --- | --- |
| **Breathing Rituals** | [cite_start]Guided exercises (Box, 4-7-8) with animated visual timers and Framer Motion[cite: 91, 128]. |
| **Mood Journal** | [cite_start]Real-time emotional tracking with emotion tags persisted in Firebase Firestore[cite: 88, 93]. |
| **Reflective Journal** | [cite_start]Rich text entries with privacy toggles and voice-to-text input capability[cite: 90, 91]. |
| **Accessibility (WCAG 2.1)** | [cite_start]High Contrast mode, Reduced Motion, and Dyslexia-friendly fonts (OpenDyslexic)[cite: 91, 121]. |
| **Analytics** | [cite_start]Visual trajectory charts and factor correlation analysis using Recharts[cite: 92]. |

### Tech Stack
- [cite_start]**Framework:** Next.js 15 (App Router) with React 19[cite: 98].
- [cite_start]**Styling:** Tailwind CSS v4 (@theme directive)[cite: 98].
- [cite_start]**Animations:** Framer Motion (120 FPS feel)[cite: 91].
- [cite_start]**Database:** Firebase Firestore (Real-time synchronization)[cite: 93].
- [cite_start]**Auth:** Firebase Authentication (Email/Password & Google)[cite: 93].
- **State:** Zustand with Persist Middleware.

### Project Structure
```text
src/
├── app/          # Next.js App Router (Auth, Dashboard, Journal, Breathe)
├── components/   # UI Library (Shadcn) & Shared Layouts
├── features/     # Domain Logic (Mood, Journal, Users)
├── services/     # Firebase Client & Admin SDK Setup
└── store/        # Zustand State Stores

How to Run Locally
Clone the repository: git clone https://github.com/CodeMaster-D/Alora.git

Install dependencies: npm install

Set up environment variables in .env.local (Firebase API Keys).

Run development server: npm run dev

Built for TECHSOFT 2026 - Software Engineering Competition.
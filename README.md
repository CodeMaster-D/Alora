# ALORA - Mental Wellness Platform

## Institusi
SMK Telkom 1 Medan

## Anggota Tim
- Ketua: Djob Misael
- Anggota 1: Farisya Fatanansyah
- Anggota 2: -

## Deskripsi Karya
**Subtema: Kesehatan**

### Latar Belakang
Dalam perkembangan teknologi informasi yang pesat, website tidak hanya sekadar media informasi, tetapi juga sarana edukasi interaktif untuk meningkatkan kesadaran masyarakat terhadap isu kesehatan mental. Alora hadir sebagai inovasi digital yang menggabungkan estetika visual modern (Liquid Glassmorphism) dengan dampak sosial positif bagi masyarakat.

### Tujuan
* Mewadahi kreativitas dalam perancangan website yang mengintegrasikan aspek estetika, fungsionalitas, dan kenyamanan pengguna secara optimal.
* Mendorong pemanfaatan teknologi secara strategis untuk menciptakan solusi digital yang bermanfaat dalam menyampaikan informasi kesehatan mental secara efektif.

### Manfaat
* Memberikan sarana bagi pengguna untuk melakukan refleksi diri dan pengelolaan emosi melalui fitur interaktif yang responsif.
* Menyediakan aksesibilitas digital yang inklusif bagi berbagai kalangan pengguna (WCAG 2.1) untuk meningkatkan kualitas hidup.

## Link Website
https://alora.web.id

---

## Technical Specifications & Features

### Key Features
- **Breathing Rituals:** Latihan pernapasan terpandu (Box, 4-7-8) dengan animasi visual 120 FPS menggunakan Framer Motion.
- **Mood Journal:** Pelacakan emosi real-time yang tersinkronisasi langsung ke Firebase Firestore.
- **Reflective Journal:** Rich text editor untuk refleksi diri dengan fitur voice-to-text.
- **Accessibility:** High Contrast mode, Reduced Motion, dan Dyslexia-friendly fonts (OpenDyslexic).
- **Data Analytics:** Visualisasi tren kesehatan mental menggunakan Recharts.

### Tech Stack
- **Framework:** Next.js 15 (App Router) & React 19
- **Styling:** Tailwind CSS v4 (@theme directive)
- **Database:** Firebase Firestore & Auth
- **State:** Zustand with Persist Middleware

### Project Structure
```text
src/
├── app/          # App Router (Auth, Dashboard, Journal, Breathe)
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
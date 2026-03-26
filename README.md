# ALORA - Mental Wellness Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Production-success?style=flat-square)]()

Alora adalah platform kesehatan mental premium yang dirancang untuk membantu pengguna menyeimbangkan kehidupan digital melalui latihan pernapasan mindful, jurnal reflektif, dan pelacakan emosi secara real-time. Proyek ini dikembangkan untuk TECHSOFT 2026 - Software Engineering Competition.

Link Website: [https://alora.web.id](https://alora.web.id)

---

## Deskripsi Proyek

Dalam perkembangan teknologi informasi yang pesat, website tidak hanya sekadar media informasi, tetapi juga sarana edukasi interaktif untuk meningkatkan kesadaran masyarakat terhadap isu kesehatan mental. Alora hadir sebagai inovasi digital yang menggabungkan estetika visual dengan dampak sosial positif bagi masyarakat.

### Tujuan
* Mewadahi kreativitas dalam perancangan website yang mengintegrasikan aspek estetika, fungsionalitas, dan kenyamanan pengguna secara optimal.
* Mendorong pemanfaatan teknologi secara strategis untuk menciptakan solusi digital yang bermanfaat dalam menyampaikan informasi kesehatan mental secara efektif.

### Manfaat
* Memberikan sarana bagi pengguna untuk melakukan refleksi diri dan pengelolaan emosi melalui fitur interaktif yang responsif.
* Menyediakan aksesibilitas digital yang inklusif bagi berbagai kalangan pengguna untuk meningkatkan kualitas hidup.

---

## Fitur Utama

### 1. Breathing Rituals
Latihan pernapasan terpandu (Metode Box, 4-7-8) dengan animasi visual timer menggunakan Framer Motion untuk menciptakan pengalaman yang menenangkan.

### 2. Mood Journal
Pelacakan emosi secara real-time dengan tag emosi yang tersinkronisasi langsung ke Firebase Firestore, memungkinkan analisis tren suasana hati pengguna.

### 3. Reflective Journal
Entri teks kaya (rich text) untuk refleksi diri yang dilengkapi dengan pengaturan privasi serta kemampuan input suara (voice-to-text).

### 4. Aksesibilitas (WCAG 2.1)
Implementasi inklusivitas digital melalui fitur High Contrast mode, Reduced Motion, dan dukungan font khusus disleksia (OpenDyslexic).

### 5. Analisis Data
Visualisasi trayektori emosi dan analisis korelasi faktor kesehatan mental menggunakan pustaka Recharts.

---

## Spesifikasi Teknis

### Tech Stack
* **Framework:** Next.js 15 (App Router) dengan React 19.
* **Styling:** Tailwind CSS v4 (@theme directive).
* **Animations:** Framer Motion (Optimasi hingga 120 FPS).
* **Database:** Firebase Firestore (Real-time synchronization).
* **Authentication:** Firebase Authentication (Email/Password & Google).
* **State Management:** Zustand dengan Persist Middleware.

### Struktur Proyek
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
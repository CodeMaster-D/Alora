import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate"; // Pake import, bukan require

const config: Config = {
  // Ganti dari ["class"] ke "class"
  darkMode: "class", 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#889E81",
          light: "#A8B8A1",
          dark: "#687E61",
        },
        secondary: {
          DEFAULT: "#9FA8DA",
          light: "#BFC8EA",
          dark: "#7F88BA",
        },
        accent: {
          DEFAULT: "#D48C70",
          light: "#E4AC90",
          dark: "#B46C50",
        },
        surface: "#FDFBF7",
        text: "#2C3333",
        // Pastikan variabel HSL ini ada di globals.css lu
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        dyslexic: ["OpenDyslexic", "sans-serif"],
        hyperlegible: ["Atkinson Hyperlegible", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        breathe: "breathe 4s ease-in-out infinite",
      },
    },
  },
  // Panggil plugin yang sudah di-import tadi
  plugins: [tailwindcssAnimate], 
};

export default config;
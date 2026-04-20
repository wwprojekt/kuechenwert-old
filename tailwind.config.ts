import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ============ BRAND = AMBER/HONEY (Warm-DNA, CaravanWert-Style) ============
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Primary CTA
          600: "#d97706", // Primary CTA Hover
          700: "#b45309", // Dark Accent (Eyebrow, Logo-Gradient-End)
          800: "#92400e",
          900: "#78350f", // Dark Text auf hellem BG
          950: "#451a03",
        },
        // ============ ACCENT = AMBER-LIGHTER (Hover/Subtle) ============
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // ============ TEAL = COOL-TRUST (für Trust-Sektionen, Decorations) ============
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // ============ SUCCESS (nur für Häkchen, Positiv-Indikator) ============
        success: {
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        // ============ SURFACE = WARM-STONE (statt Cool-Slate) ============
        surface: {
          DEFAULT: "#ffffff",
          soft: "#fafaf9", // stone-50 (warmes Beige)
          strong: "#f5f5f4", // stone-100
        },
        // ============ INK = ECHTES SCHWARZ (statt Slate) ============
        ink: {
          DEFAULT: "#0a0a0a", // fast schwarz, mit Hauch Wärme
          muted: "#525252", // neutral-600
          subtle: "#a3a3a3", // neutral-400
        },
      },
      fontFamily: {
        sans: ["var(--font-fira)", "system-ui", "sans-serif"],
        display: ["var(--font-fira)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "tight-2": "-0.02em",
        "tight-3": "-0.03em",
      },
      boxShadow: {
        // Tailwind-default-aligned, sauberer als custom dunkle Shadows
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        "card-active": "0 20px 25px -5px rgb(245 158 11 / 0.18), 0 8px 10px -6px rgb(245 158 11 / 0.10)",
        "card-elevated": "0 25px 50px -12px rgb(0 0 0 / 0.18)",
      },
      borderRadius: {
        card: "1rem", // 16px statt 14px (CaravanWert-Standard)
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
} satisfies Config;

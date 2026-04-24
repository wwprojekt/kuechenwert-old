import type { Config } from "tailwindcss";

/**
 * Design-Tokens extrahiert aus dem Live-CSS von caravanwert.de
 * (index-CiV7EAFp.css, 184 kB). Primärfarbe ist ein tiefes Cyan-Teal
 *  --primary: hsl(191 68% 38%)  ≈ #1f88a3
 * Das wird bei uns zur `brand`-Palette; die 10 Stufen sind numerisch
 * aus dem Primary abgeleitet.
 */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ============ BRAND = CYAN-TEAL (CaravanWert hsl(191 68% 38%)) ============
        brand: {
          50: "#ecf7fa",
          100: "#d0ecf3",
          200: "#a6d9e6",
          300: "#74c1d5",
          400: "#40a6c0",
          500: "#1f88a3", // Primary (CaravanWert --primary)
          600: "#186e86", // Primary-Dark  (CaravanWert --primary-dark)
          700: "#155c70",
          800: "#164a5b",
          900: "#103c4c",
          950: "#0a2630",
        },
        // ============ ACCENT = identisch mit brand (CaravanWert --accent == --primary) ============
        accent: {
          50: "#ecf7fa",
          100: "#d0ecf3",
          200: "#a6d9e6",
          300: "#74c1d5",
          400: "#40a6c0",
          500: "#1f88a3",
          600: "#186e86",
          700: "#155c70",
          800: "#164a5b",
          900: "#103c4c",
        },
        // ============ SECONDARY = dunkles Blaugrau (CaravanWert hsl(210 24% 16%)) ============
        secondary: {
          50: "#f1f4f7",
          100: "#dbe1ea",
          500: "#3d4f66",
          700: "#243244",
          900: "#1f2937",
          950: "#111827",
        },
        // ============ SUCCESS (Häkchen, positive Signale) ============
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
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
        // ============ SURFACE = kühles Hellgrau (CaravanWert --background hsl(210 20% 96%)) ============
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f1f5f9", // slate-100-ish, kühler als das frühere stone
          strong: "#e2e8f0",
        },
        // ============ INK = CaravanWert --foreground hsl(210 24% 16%) ============
        ink: {
          DEFAULT: "#1f2937",
          muted: "#475569",
          subtle: "#94a3b8",
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
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        // active = Cyan-Teal-Tint (ersetzt den früheren Amber-Tint)
        "card-active": "0 20px 25px -5px rgb(31 136 163 / 0.22), 0 8px 10px -6px rgb(31 136 163 / 0.14)",
        "card-elevated": "0 25px 50px -12px rgb(0 0 0 / 0.18)",
      },
      borderRadius: {
        // CaravanWert --radius: .375rem (6px)
        card: "0.375rem",
      },
      backgroundImage: {
        // Exakte Entsprechung zu --gradient-hero von caravanwert.de
        "hero-gradient": "linear-gradient(135deg, hsl(191 68% 43%) 0%, hsl(191 68% 32%) 100%)",
        "hero-gradient-hover": "linear-gradient(135deg, hsl(191 68% 46%) 0%, hsl(191 68% 35%) 100%)",
        "secondary-gradient": "linear-gradient(135deg, hsl(210 24% 16%) 0%, hsl(210 30% 24%) 100%)",
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
} satisfies Config;

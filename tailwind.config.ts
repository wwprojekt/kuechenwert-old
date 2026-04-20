import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5fb",
          100: "#dbe7f4",
          200: "#b6cee9",
          300: "#86aed8",
          400: "#5489c3",
          500: "#3169ad",
          600: "#21528f",
          700: "#1a4276",
          800: "#163660",
          900: "#11284a",
          950: "#0a1a32",
        },
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#1fb97a",
          600: "#16a065",
          700: "#127f52",
          800: "#0f6543",
          900: "#0c5238",
        },
        success: {
          500: "#1fb97a",
          600: "#16a065",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f8fafc",
          strong: "#f1f5f9",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          subtle: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover": "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
        "card-active": "0 8px 24px -4px rgb(33 82 143 / 0.18), 0 4px 8px -2px rgb(33 82 143 / 0.10)",
      },
      borderRadius: {
        card: "0.875rem",
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
} satisfies Config;

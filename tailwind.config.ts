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
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "tight-2": "-0.02em",
        "tight-3": "-0.03em",
      },
      boxShadow: {
        card: "0 2px 4px -1px rgb(15 23 42 / 0.06), 0 4px 12px -2px rgb(15 23 42 / 0.08)",
        "card-hover": "0 8px 16px -4px rgb(15 23 42 / 0.10), 0 4px 8px -2px rgb(15 23 42 / 0.08)",
        "card-active": "0 16px 40px -8px rgb(26 66 118 / 0.22), 0 6px 12px -3px rgb(26 66 118 / 0.14)",
        "card-elevated": "0 20px 50px -12px rgb(15 23 42 / 0.18), 0 8px 18px -6px rgb(15 23 42 / 0.10)",
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

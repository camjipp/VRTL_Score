import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at top left, var(--tw-gradient-stops))",
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-2) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-2": "rgb(var(--text-2) / <alpha-value>)",
        "text-3": "rgb(var(--text-3) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        bg0: "rgb(var(--bg-0) / <alpha-value>)",
        bg1: "rgb(var(--bg-1) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        /* Authority states (app theme) */
        authority: {
          dominant: "rgb(var(--authority-dominant, 34 197 94) / <alpha-value>)",
          stable: "rgb(var(--authority-stable, 148 163 184) / <alpha-value>)",
          watchlist: "rgb(var(--authority-watchlist, 245 158 11) / <alpha-value>)",
          losing: "rgb(var(--authority-losing, 127 29 29) / <alpha-value>)",
        },
      },
      boxShadow: {
        lift: "var(--shadow-lift)"
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        app: "6px",
        "app-lg": "8px",
      }
    }
  },
  plugins: []
};

export default config;




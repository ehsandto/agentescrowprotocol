import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12100c",
          900: "#1a1612",
          800: "#241f19",
          700: "#312a22",
        },
        mist: {
          400: "#a3988a",
          300: "#d7cec2",
          100: "#f7f1e8",
        },
        accent: {
          DEFAULT: "#e24b2a",
          dim: "#c43b1d",
          glow: "rgba(226, 75, 42, 0.18)",
        },
        signal: {
          DEFAULT: "#e7c27a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;

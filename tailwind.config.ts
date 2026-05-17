import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Painel de Missão" - dark, focada, RPG
        background: "#0a0c10",
        surface: "#0f1117",
        "surface-2": "#161b22",
        border: "#21262d",
        "border-active": "#388bfd",

        // Identidades de matérias (associadas aos pesos)
        math: {
          DEFAULT: "#f78166",   // vermelho-laranja = prioridade máxima
          dim: "#3d1a18",
          glow: "rgba(247,129,102,0.15)",
        },
        languages: {
          DEFAULT: "#79c0ff",   // azul claro
          dim: "#0d2032",
          glow: "rgba(121,192,255,0.15)",
        },
        humanities: {
          DEFAULT: "#a5d6a7",   // verde suave
          dim: "#1b2d1c",
          glow: "rgba(165,214,167,0.15)",
        },
        sciences: {
          DEFAULT: "#ce93d8",   // lilás
          dim: "#2a1b2e",
          glow: "rgba(206,147,216,0.15)",
        },
        writing: {
          DEFAULT: "#ffd54f",   // âmbar = obrigatório diário
          dim: "#2e2500",
          glow: "rgba(255,213,79,0.15)",
        },

        // XP / Gamificação
        xp: "#56d364",
        "xp-dim": "#0f2f14",
        accent: "#388bfd",
        "accent-dim": "#0d1f3c",

        muted: "#8b949e",
        "muted-foreground": "#6e7681",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-math": "0 0 20px rgba(247,129,102,0.3)",
        "glow-xp": "0 0 20px rgba(86,211,100,0.3)",
        "glow-accent": "0 0 20px rgba(56,139,253,0.3)",
        "glow-writing": "0 0 20px rgba(255,213,79,0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "xp-gain": "xpGain 0.6s ease-out forwards",
        "streak-flame": "streakFlame 1s ease-in-out infinite alternate",
      },
      keyframes: {
        xpGain: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-40px) scale(1.4)", opacity: "0" },
        },
        streakFlame: {
          "0%": { filter: "brightness(1) saturate(1)" },
          "100%": { filter: "brightness(1.3) saturate(1.5)" },
        },
      },
    },
  },
  plugins: [],
}

export default config

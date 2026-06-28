/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: "#0A0A0F",
        surface: "#111118",
        surfaceHover: "#1A1A25",
        surfaceBorder: "rgba(255, 255, 255, 0.08)",
        accent: "#00E5FF", // Electric Cyan primary accent
        accentDark: "#00B3CC",
        accentOrange: "#FF6B35",
        textPrimary: "#F0F0F5",
        textSecondary: "#8888A0",
        prGold: "#FFD700",
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        accentGlow: '0 0 25px rgba(0, 229, 255, 0.4)',
        orangeGlow: '0 0 25px rgba(255, 107, 53, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

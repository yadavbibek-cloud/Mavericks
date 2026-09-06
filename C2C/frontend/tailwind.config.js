/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grid: {
          dark: '#070b14',
          panel: '#0c1222',
          surface: '#121b33',
          border: '#1e2942',
          accent: '#00f0ff',
          neon: '#00e5ff',
          healthy: '#10b981',
          watch: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

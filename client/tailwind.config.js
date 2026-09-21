/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          neon: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          indigo: '#6366f1'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}

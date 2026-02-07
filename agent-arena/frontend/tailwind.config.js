/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ff2e96",
        "primary-glow": "rgba(255, 46, 150, 0.4)",
        "secondary": "#00d4ff",
        "secondary-glow": "rgba(0, 212, 255, 0.4)",
        "background-light": "#2a1b24",
        "background-dark": "#181014",
        "surface-dark": "#281b21",
        "surface-darker": "#1f1419",
        "text-dim": "#bc9aab",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "mono": ["Space Grotesk", "monospace"]
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #3a2730 1px, transparent 1px), linear-gradient(to bottom, #3a2730 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}

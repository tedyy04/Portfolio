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
        // Warm cream background palette
        "background": "#f5f2eb",
        "on-background": "#1a1a18",

        "surface": "#f5f2eb",
        "surface-dim": "#ebe8e1",
        "surface-bright": "#fefdf9",

        // Neutral charcoal scale
        "charcoal": "#1a1a18",
        "charcoal-83": "rgba(26,26,24,0.83)",
        "charcoal-82": "rgba(26,26,24,0.82)",
        "charcoal-40": "rgba(26,26,24,0.40)",
        "charcoal-4": "rgba(26,26,24,0.04)",
        "charcoal-3": "rgba(26,26,24,0.03)",
        "muted": "#5c5c5a",
        "off-white": "#faf9f5",

        "primary": "#1a1a18",
        "on-primary": "#faf9f5",

        "secondary": "rgba(26,26,24,0.04)",
        "on-secondary": "#1a1a18",

        "outline": "#e6e3dc",
        "outline-variant": "rgba(26,26,24,0.35)",
        "focus-ring": "rgba(26,26,24,0.4)",

        // Extended tokens — used across Album, Contact, Category pages
        "on-surface": "#1a1a18",
        "on-surface-variant": "#5c5c5a",
        "surface-container-low": "#ede9e2",
        "surface-container": "#e5e2db",
      },
      fontFamily: {
        // Outfit: modern, clean, punchy display sans-serif
        "headline": ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        // DM Sans: clean humanist sans for body + labels
        "body": ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        "label": ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "headline-tight": "-0.03em",
        "display": "-0.04em",
        "caps": "0.08em",
      },
      borderRadius: {
        "DEFAULT": "6px",
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "pill": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

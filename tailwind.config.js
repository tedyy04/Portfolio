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
        // Lovable warm cream background
        "background": "#f7f4ed",
        "on-background": "#1c1c1c",

        "surface": "#f7f4ed",
        "surface-dim": "#eceae4",
        "surface-bright": "#ffffff",

        // Lovable opacity-based neutral scale derivations (simulated with hex where opacity is tricky, or just use css variables)
        // Here we just define the base ones.
        "charcoal": "#1c1c1c",
        "charcoal-83": "rgba(28,28,28,0.83)",
        "charcoal-82": "rgba(28,28,28,0.82)",
        "charcoal-40": "rgba(28,28,28,0.40)",
        "charcoal-4": "rgba(28,28,28,0.04)",
        "charcoal-3": "rgba(28,28,28,0.03)",
        "muted": "#5f5f5d",
        "off-white": "#fcfbf8",

        "primary": "#1c1c1c",
        "on-primary": "#fcfbf8",
        
        "secondary": "rgba(28,28,28,0.04)",
        "on-secondary": "#1c1c1c",

        "outline": "#eceae4",
        "outline-variant": "rgba(28,28,28,0.4)",
        "focus-ring": "rgba(59,130,246,0.5)",
      },
      fontFamily: {
        // Lovable uses Camera Plain Variable, fallback to system UI sans
        "headline": ["Camera Plain Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        "body": ["Camera Plain Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        "label": ["Camera Plain Variable", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "6px",
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "pill": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
